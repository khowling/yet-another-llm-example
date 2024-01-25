import { Database } from "bun:sqlite";
import { Cookie, Elysia, t } from "elysia";
import { html } from '@elysiajs/html'
import { Stream } from '@elysiajs/stream'
import { staticPlugin } from '@elysiajs/static'
import { MongoClient, ObjectId } from 'mongodb'
import { OpenAIClient, type ChatRequestMessage } from '@azure/openai'
import { DefaultAzureCredential,  } from '@azure/identity';
import { ProductOrCategory, TenantDefinition, containerClient, initCatalog } from './init_config'
import Index, { HTMLPage } from './components/page'
import Products from './components/products'
import Help from "./components/help";
import TextResponse from "./components/textResponse";
import Cart from "./components/cart";
import Llm from "./components/llm";
import TextStream from "./components/textStream";


// Going to use Buns embedded DB for session info, just for testing, for production, use mongo/cosmos!
const memorydb = new Database(":memory:");
const createSessionTable = memorydb.query(`create table session (sessionid INTEGER PRIMARY KEY, date INTEGER);`);
const createPromptHistoryTable = memorydb.query(`create table prompt_history (sessionid INTEGER, date INTEGER, role STRING, content STRING);`)
const createCartTable = memorydb.query(`create table cart (sessionid INTEGER, productid STRING, heading STRING, qty NUMBER);`)
createSessionTable.run();
createPromptHistoryTable.run();
createCartTable.run();

const newSession = memorydb.query<{sessionid: number}, number>(`INSERT INTO session (date) VALUES  (:1) RETURNING sessionid;`);
const newCartItem = memorydb.query<null, {$sessionid: number, $productid: string, $heading: string, $qty: number}>('INSERT INTO cart VALUES  ($sessionid, $productid, $heading, $qty)');
const listCart = memorydb.query<{productid: string, heading: string,  qty: number}, {$sessionid: number}>('SELECT productid, heading, qty FROM cart WHERE sessionid = $sessionid;');
const newPromptHistory = memorydb.query<null, {$sessionid: number, $date: number, $role: string, $content: string}>('INSERT INTO prompt_history VALUES  ($sessionid, $date, $role, $content)');
const listPromptHistory = memorydb.query<{date: number, role: string, content: string}, {$sessionid: number}>('SELECT date, role, content FROM prompt_history WHERE sessionid = $sessionid ORDER BY date ASC;');

const murl : string = process.env.AISHOP_MONGO_CONNECTION_STR || "mongodb://localhost:27017/azshop?replicaSet=rs0"
const client = new MongoClient(murl);

const defCredential = new DefaultAzureCredential()
const aiclient = new OpenAIClient(process.env.AISHOP_OPENAI_ENDPOINT as string, defCredential);


const imageBaseUrl = '/file' // process.env.AISHOP_STORAGE_ACCOUNT ? `https://${process.env.AISHOP_STORAGE_ACCOUNT}.blob.core.windows.net/${process.env.AISHOP_IMAGE_CONTAINER}` : `https://127.0.0.1:10000/devstoreaccount1/${process.env.AISHOP_IMAGE_CONTAINER}`

 
export const getDb = async () => {
    // Connect MongoDB
  await client.connect();
  return client.db();
}


const explore = async (session : Cookie<any>, partition_key: string, type: 'Category' | 'Product', category?: string) => {
    const db = await getDb();
    console.log (`/explore got partition_key ${partition_key}`)
    const category_or_products = await db.collection('products').find({partition_key, type, ...(category && {category_id: new ObjectId(category)})}).toArray() as unknown as Array<ProductOrCategory>
   
    if (category) newPromptHistory.run({
        $sessionid: session.value, 
        $date: Date.now(), 
        $role: "user", 
        $content: "Now, I'm looking at the products " + category_or_products.map(p => `"${p.heading}"`).join(' and ')
    })
   
    return <Products categories={category_or_products} imageBaseUrl={imageBaseUrl}/>
}

const app = new Elysia()
    .use(staticPlugin())
    .state('tenant', {} as TenantDefinition)
    .state('partition_key', '' as string)
    .state('initial_system_message', '' as string)
    .use(html())
    .get('/load-catalogue', ({ cookie: { session }}) => {
        session.remove()
        return <TextStream sseUrl='/load-catalogue-sse' runEvent='running' completeEvent='done'/>
    })
    .get('/load-catalogue-sse', async ({store}) => new Stream(async (stream) => {
        var messages = ''
        var log = (msg:string) => { messages += <div>{msg}</div>; stream.send(messages)}
        try {
            stream.send ('Calling initCatalog with [setup/food.json]...')
            let tenant = await initCatalog('setup/food.json', log) as TenantDefinition
            if (!tenant) throw new Error('failed to create tenant')

            // Setting partition key and initial system message
            store.tenant = tenant
            store.partition_key = tenant.partition_key
            log (`Storing tenant & partition_key ${store.partition_key}`)

            const db = await getDb();
            const cat_prods = await db.collection('products').find({ partition_key: store.partition_key }).toArray() as unknown as Array<ProductOrCategory>
            store.initial_system_message = tenant.aiSystemMessage + cat_prods.filter(c => c.type === 'Category').map (c => `.  In the Category "${c.heading}", we sell ${cat_prods.filter(p => p.type === "Product" && c._id.equals(p.category_id) ).map(p => `"${p.heading}"`).join(' and ')}`).join('. ')
            log (`Storing initial_system_message: ${store.initial_system_message}`)

            stream.event = 'done'
            stream.send(
                <div><div>{messages}</div>
                <div role="alert" class="alert alert-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>Success, click <a  className="link link-primary" href="/">here</a></span>
                </div></div>);
            stream.close()
        } catch (e: any) {
            console.error(e);
            stream.event = 'done'
            stream.send(
                <div><div>{messages}</div>
                <div role="alert" class="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Error! Task failed: ${e}.</span>
                </div></div>);
            stream.close()
        }
    }, { event: 'running' }))
    .get('/reset', ({set,  cookie: { session }}) => {
        session.remove()
        set.headers['HX-Refresh'] = 'true'
        set.headers['HX-Redirect'] = '/'
    })
    .get('/', ({set, store,  cookie: { session } }) => {
        try {

            if (!store.partition_key) {
                set.redirect = '/load-catalogue'
                return
            }

            if (!session.value) {
                console.log (`/  creating new session`)
                const { sessionid } = newSession.all(Date.now())[0]
                session.value = sessionid

                newPromptHistory.run({
                    $sessionid: session.value, 
                    $date: Date.now(), 
                    $role: "system", 
                    $content: store.initial_system_message
                })

            } 

            return <Index tenant={store.tenant} imageBaseUrl={imageBaseUrl}/>
        } catch (error: any) {
            set.status = 500
            return JSON.stringify(error)
        }
    })
    .get('/help', () =>
        <Help full={false} imageBaseUrl={imageBaseUrl}/>
    )
    .get('/explore', async ({cookie: { session }, store: { partition_key}}) => 
        await explore(session, partition_key, 'Category')
    )
    .get('/explore/:category', async ({ cookie: { session }, store: { partition_key}, params: { category } }) =>
        await explore(session, partition_key, 'Product', category)
    )
    .get('/file/*', async ({ set, params }) => {
        const filepath = params['*'];
        try {
          const blobClient = containerClient.getBlobClient(filepath);
          const dl = await blobClient.download()
          return new Stream(dl.readableStreamBody)
        } catch (e: any) {
            set.status = 500
            return e.message
        } 
    })
    .post('/add/:productid', async ({ set, store: { partition_key}, params: { productid }, cookie: { session } }) => {
        try {
          const db = await getDb();
          const product = await db.collection('products').findOne({ partition_key, _id: new ObjectId(productid)})
      
          //sess.cart = [{ product, quantity: 1}].concat(sess.cart || [])
          newCartItem.run({$sessionid: session.value, $productid: productid, $heading: product?.heading, $qty: 1})
          //sess.history = [...(sess.history || []), { role: 'user', content: `I added ${product?.heading}  to my cart`}]
          return <TextResponse answer={`${product?.heading} added to your cart`}/>
        } catch (error: any) {
          set.status = 500
          return error
        }
      })
      .get('/cart', async ({set, cookie: { session }}) => {
        try {
            const cart = listCart.all({$sessionid: session.value})
            return <Cart cart={cart} />
        } catch (error: any) {
            set.status = 500
            return error
        }
    })
    .post('/api/chat/request',({body, cookie: { session }}) => {
    
        const chatDateKey = Date.now()
        newPromptHistory.run({
            $sessionid: session.value, 
            $date: chatDateKey, 
            $role: "user", 
            $content: body.question
        })

        return <Llm chatid={'' + chatDateKey} question={body.question}/>
      }, {
        body: t.Object({
            question: t.String()
        })
    })
    .get('/api/chat/completion/:chatid', async ({params: { chatid }, cookie: { session}}) => new Stream(async (stream) => {

        try {

            if (!process.env.AISHOP_OPENAI_MODELNAME) throw new Error('AISHOP_OPENAI_MODELNAME not set')
            const prompt_history = listPromptHistory.all({$sessionid: session.value}) 
            const messages =  prompt_history.map(p => {return {role: p.role, content: p.content}}) as Array<ChatRequestMessage>

            const events = await aiclient.streamChatCompletions(process.env.AISHOP_OPENAI_MODELNAME as string, messages, { maxTokens: 256,  });

            let response = '';
            let isopencode = false;

            for await (const event of events) {
                for (const choice of event.choices) {
                    const delta = choice.delta?.content;

                    if (delta !== undefined) {

                        response += delta;
                    
                        const codematch = response.match(/```(\w*)\n/)
                        if (codematch && codematch.index) {

                            response = response.replace(/```(\w*)\n/, isopencode ?  `
                            </span>
                            <svg class="shrink-0 h-5 w-5 transition text-gray-500 group-hover:text-white" xmlns="http://www.w3.org/2000/svg"viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z"></path>
                                <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z"></path>
                            </svg>
                        </code>` :  `
                            <code class="text-sm sm:text-base inline-flex text-left items-center space-x-4 bg-gray-800 text-white rounded-lg p-4 pl-6">
                                <span class="flex gap-4">`)
                            isopencode = !isopencode
                        }
                        response = response.replaceAll('\n', '<br/>')
                        stream.send(response);
                    }
                }
            }

            newPromptHistory.run({
                $sessionid: session.value, 
                $date: Date.now(), 
                $role: "system", 
                $content: response
            })

            stream.event = `close${chatid}`
            stream.send(`<div class="chat-bubble chat-bubble-info">${response}</div>`);
            stream.close()

        } catch (e: any) {
            console.error(e);
            stream.event = `close${chatid}`
            stream.send(`<div class="chat-bubble chat-bubble-warning">I'm not available right now, please continue to use the / commands to explore and order our products (${e ? JSON.stringify(e) : ''})</div>`);
            stream.close()
        }
    }, { event: chatid }))
    .listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
