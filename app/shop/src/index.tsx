import { Database } from "bun:sqlite";
import { Cookie, Elysia, t } from "elysia";
import { html } from '@elysiajs/html'
import { Stream } from '@elysiajs/stream'
import { staticPlugin } from '@elysiajs/static'
import { MongoClient, ObjectId } from 'mongodb'
import { OpenAIClient, type ChatRequestMessage } from '@azure/openai'
import { DefaultAzureCredential,  } from '@azure/identity';
import { type ProductOrCategory, type TenantDefinition, type Images, containerClient, initCatalog } from './init_config'
import Index, { HTMLPage } from './components/page'
import Products from './components/products'
import TxtResponse from "./components/response";
import Cart from "./components/cart";
//import Llm from "./components/llm";
import TextStream from "./components/textStream";
import Command from "./components/command";


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
const listPromptHistory = memorydb.query<{role: string, content: string}, {$sessionid: number}>('SELECT role, content FROM prompt_history WHERE sessionid = $sessionid ORDER BY date ASC;');

const murl : string = process.env.AISHOP_MONGO_CONNECTION_STR || "mongodb://localhost:27017/azshop?replicaSet=rs0"
const client = new MongoClient(murl);

const defCredential = new DefaultAzureCredential()
const aiclient = new OpenAIClient(process.env.AISHOP_OPENAI_ENDPOINT as string, defCredential);


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
        $content: "Your customer is now looking at the products " + category_or_products.map(p => `"${p.heading}"`).join(' and ')
    })
   
    return <Products categories={category_or_products} imageBaseUrl={imageBaseUrl}/>
}

const imageBaseUrl = '/file' // process.env.AISHOP_STORAGE_ACCOUNT ? `https://${process.env.AISHOP_STORAGE_ACCOUNT}.blob.core.windows.net/${process.env.AISHOP_IMAGE_CONTAINER}` : `https://127.0.0.1:10000/devstoreaccount1/${process.env.AISHOP_IMAGE_CONTAINER}`
function getImageSrc(image: Images)    {
    if (image.pathname) { // local file
        return `${imageBaseUrl}/${image.pathname}`
    }
    return image.url
}

const app = new Elysia()
    .use(staticPlugin())
    .state('tenant', {} as TenantDefinition)
    .state('partition_key', '' as string)
    .state('initial_system_message', '' as string)
    .use(html())
    .get('/load-catalogue', ({ query: {f}, cookie: { session }}) => {
        session.remove()
        return <TextStream sseUrl={`/load-catalogue-sse?f=${f}`} runEvent='running' completeEvent='done'/>
    }, {
        query: t.Object({
            f: t.String({default: 'setup/food.json'})
        })
    })
    .get('/load-catalogue-sse', async ({query: {f}, store}) => new Stream(async (stream) => {

        var messages = ''
        var log = (msg:string) => { messages += <div>{msg}</div>; stream.send(messages)}

        log('Removing existing app store tenant info...')
        store.tenant = {} as TenantDefinition
        store.partition_key = ''
        store.initial_system_message = ''
        
        try {
            log (`Calling initCatalog with [${f}]...`)
            let tenant = await initCatalog(f, log) as TenantDefinition
            if (!tenant) throw new Error('failed to create tenant')
             
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
    }, { event: 'running' }), {
        query: t.Object({
            f: t.String()
        })
    })
    .get('/reset', ({set, store, cookie: { session }}) => {
        session.remove()
        store.partition_key = ''
        set.headers['HX-Refresh'] = 'true'
        set.headers['HX-Redirect'] = '/'
    })
    .get('/', async ({set, store,  cookie: { session } }) => {
        try {

            if (!store.partition_key) {
                // 1st time the app has been used.
                // Setting partition key and initial system message
                const db = await getDb();
                const tenant = await db.collection('tenant').findOne({}) as unknown as TenantDefinition
                
                if (!tenant) {
                    console.log (`No Tenant found, redirecting to /load-catalogue`)
                    set.redirect = '/load-catalogue'
                    return
                }

                store.tenant = tenant
                store.partition_key = tenant.partition_key
                console.log (`Storing tenant, partition_key & system message: (partition_key=${store.partition_key})`)

                const cat_prods = await db.collection('products').find({ partition_key: store.partition_key }).toArray() as unknown as Array<ProductOrCategory>
                store.initial_system_message = 
                    `Your name is ${tenant.assistantName}. ` +
                    tenant.assistantGrounding + '. ' +
                    'Your only here to help your customers select between these items: ' + cat_prods.filter(c => c.type === 'Category').map (c => `In the Category name "${c.heading}" (ID "${c._id}"), we have ${cat_prods.filter(p => p.type === "Product" && c._id.equals(p.category_id) ).map(p => `"${p.heading}"`).join(', ')}`).join('. ') + '. ' +
                    'Instead of using the Category name or ID directly in your response, use this HTML format instead: ' + <Command command='/explore'subcommand="EXAMPLECATEGORY" args={new ObjectId(123)}/> + ', replacing EXAMPLECATEGORY with the actual category name and "' + new ObjectId(123) + '" with its ID.'

            }

            console.log (`/  initial_system_message=${store.initial_system_message}`)

            if (!session.value) {
                console.log (`/  creating new session`)
                const { sessionid } = newSession.all(Date.now())[0]
                session.value = sessionid
            } 

            return <Index tenant={store.tenant} imageBaseUrl={imageBaseUrl}/>
        } catch (error: any) {
            set.status = 500
            return JSON.stringify(error)
        }
    })
    .get('/help', ({store: {tenant}}) =>
        <TxtResponse assistantMessage={<div>Hi, Im {tenant.assistantName}, your assistant, type <Command command='/explore'/> or <Command command='/cart'/>  at any time. or... just chat to me, I can be very helpful</div>} assistantImageSrc={getImageSrc(tenant.assistantImage)}/>
    )
    .get('/explore', async ({cookie: { session }, store: { partition_key}}) => 
        await explore(session, partition_key, 'Category')
    )
    .get('/explore/:category', async ({ cookie: { session }, store: { partition_key}, params: { category } }) =>
        await explore(session, partition_key, 'Product', category)
    )
    .get('/details/:pid', ({ store: { tenant}, params: { pid } }) =>
       <TxtResponse assistantMessage={<div>Will someone hurry up and implement this feature please!</div>} assistantImageSrc={getImageSrc(tenant.assistantImage)}/>
    )
    .get('/checkout', ({ store: { tenant}}) =>
       <TxtResponse assistantMessage={<div>Will someone hurry up and implement this feature please!</div>} assistantImageSrc={getImageSrc(tenant.assistantImage)}/>
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
    .post('/add/:productid', async ({ set, store: { partition_key, tenant }, params: { productid }, cookie: { session } }) => {
        try {
          const db = await getDb();
          const product = await db.collection('products').findOne({ partition_key, _id: new ObjectId(productid)})
          newCartItem.run({$sessionid: session.value, $productid: productid, $heading: product?.heading, $qty: 1})
          return <TxtResponse assistantMessage={<div>{product?.heading} added to your cart, click <Command command='/cart'/> to view</div>} assistantImageSrc={getImageSrc(tenant.assistantImage)}/>
          
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
    .post('/api/chat/request',({body, store: { tenant}, cookie: { session }}) => {
    
        const chatDateKey = Date.now(), chatid = '' + chatDateKey
        newPromptHistory.run({
            $sessionid: session.value, 
            $date: chatDateKey, 
            $role: "user", 
            $content: body.question
        })
        const scrollWorkaround = { 'hx-on:htmx:sse-message' : `document.getElementById('messages').scrollIntoView(false)`}
        return <TxtResponse assistantMessage={
            <div id={`sse-response${chatid}`} hx-ext="sse" sse-connect={`/api/chat/completion/${chatid}`} sse-swap={chatid} hx-swap="innerHTML" hx-target={`find #stream${chatid}`} {...scrollWorkaround}>
                <div sse-swap={`close${chatid}`} hx-swap="outerHTML"  hx-target={`closest #sse-response${chatid}`}></div>
                <div style="width: fit-content;" id={`stream${chatid}`}></div>
            </div>
        } assistantImageSrc={getImageSrc(tenant.assistantImage)}/> 

      }, {
        body: t.Object({
            question: t.String()
        })
    })
    .get('/api/chat/completion/:chatid', async ({params: { chatid }, store: { initial_system_message}, cookie: { session}}) => new Stream(async (stream) => {

        try {

            if (!process.env.AISHOP_OPENAI_MODELNAME) throw new Error('AISHOP_OPENAI_MODELNAME not set')
            const prompt_history = [{role: "system", content: initial_system_message}, ...listPromptHistory.all({$sessionid: session.value})] as Array<ChatRequestMessage>

            const events = await aiclient.streamChatCompletions(process.env.AISHOP_OPENAI_MODELNAME as string, prompt_history, { maxTokens: 512 });

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
            const scrollWorkaround = { 'hx-on:htmx:after-settle' : `document.getElementById('messages').scrollIntoView(false)`}
            stream.send(<div class="chat-bubble chat-bubble-info" {...scrollWorkaround}>{response}</div>);
            stream.close()

        } catch (e: any) {
            console.error(e);
            stream.event = `close${chatid}`
            stream.send(`<div class="chat-bubble chat-bubble-warning">I'm not available right now, please continue to use the / commands to explore and order our products (${e ? JSON.stringify(e) : ''})</div>`);
            stream.close()
        }
    }, { event: chatid }))
    .listen(process.env.PORT || 3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
