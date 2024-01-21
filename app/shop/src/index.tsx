import { Database } from "bun:sqlite";
import { Cookie, Elysia, t } from "elysia";
import { html } from '@elysiajs/html'
import { Stream } from '@elysiajs/stream'
import { staticPlugin } from '@elysiajs/static'
import { MongoClient, ObjectId } from 'mongodb'
import { ProductOrCategory, TenantDefinition, containerClient } from './init_config'
import Index from './components/index'
import Products from './components/products'
import Help from "./components/help";
import TextResponse from "./components/textResponse";
import Cart from "./components/cart";


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


const murl : string = process.env.AISHOP_MONGO_CONNECTION_STR || "mongodb://localhost:27017/azshop?replicaSet=rs0"
const client = new MongoClient(murl);

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
   
    if (category)
    newPromptHistory.run({
        $sessionid: session.value, 
        $date: Date.now(), 
        $role: "user", 
        $content: "Now, I'm looking at the products " + category_or_products.map(p => `"${p.heading}"`).join(' and ')
    })
   
    return <Products categories={category_or_products} imageBaseUrl={imageBaseUrl}/>
}

const app = new Elysia()
    .use(staticPlugin())
    .state('partition_key', '' as string)
    .use(html())
    .get('/reset', ({set,  cookie: { session }}) => {
        session.remove()
        set.headers['HX-Refresh'] = 'true'
        set.headers['HX-Redirect'] = '/'
    })
    .get('/', async ({set, store,  cookie: { session } }) => {
        try {
            console.log (`/  session=${session}`)
            if (!session.value) {
                console.log (`/  creating new session`)
                const { sessionid } = newSession.all(Date.now())[0]
                session.value = sessionid
            } else {
                console.log (`/  existing session`)
            }

            const db = await getDb();
            const tenant = await db.collection('tenant').findOne({}) as unknown as TenantDefinition
            store.partition_key = tenant.partition_key
            console.log (`/ storing partition_key ${store.partition_key}`)

            const catandprods = await db.collection('products').find({ partition_key: store.partition_key }).toArray() as unknown as Array<ProductOrCategory>
            const cats = catandprods.filter(c => c.type === 'Category').map (c => `In the Category "${c.heading}", we sell ${catandprods.filter(p => p.type === "Product" && c._id.equals(p.category_id) ).map(p => `"${p.heading}"`).join(' and ')}`).join('. ')

            newPromptHistory.run({
                $sessionid: session.value, 
                $date: Date.now(), 
                $role: "system", 
                $content: tenant.aiSystemMessage + cats
            })
            
            return <Index tenant={tenant} imageBaseUrl={imageBaseUrl}/>
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
    .listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
