import createError from 'http-errors'
import express, { Application, Request, Response } from 'express'
import http from 'http'
import session, { Session }  from 'express-session'
import chatRouter from './routes/chat.js'
import { type TenentDefinition, initCatalog } from './setup/init_config'


import { MongoClient, ObjectId } from 'mongodb'
import { type ChatRequestMessage } from '@azure/openai'

import { DefaultAzureCredential,  } from '@azure/identity';
import { BlobServiceClient, StorageSharedKeyCredential, BlockBlobClient } from "@azure/storage-blob"


const blobServiceClient = new BlobServiceClient(
  process.env.AISHOP_STORAGE_ACCOUNT ?  `https://${process.env.AISHOP_STORAGE_ACCOUNT}.blob.core.windows.net` : 'https://127.0.0.1:10000/devstoreaccount1',
  new DefaultAzureCredential()
);

const containerClient = blobServiceClient.getContainerClient(process.env.AISHOP_IMAGE_CONTAINER || 'images');




export interface CustomSessionData extends Session {
  cart: Array<{ product: any, quantity: number }>;
  history: Array<ChatRequestMessage>,
  tenant: any
}

const murl : string = process.env.AISHOP_MONGO_CONNECTION_STR || "mongodb://localhost:27017/azshop?replicaSet=rs0"
const client = new MongoClient(murl);

const imageBaseUrl = '/file' // process.env.AISHOP_STORAGE_ACCOUNT ? `https://${process.env.AISHOP_STORAGE_ACCOUNT}.blob.core.windows.net/${process.env.AISHOP_IMAGE_CONTAINER}` : `https://127.0.0.1:10000/devstoreaccount1/${process.env.AISHOP_IMAGE_CONTAINER}`

 
export const getDb = async () => {
    // Connect MongoDB
  await client.connect();
  return client.db();
}


export const app = express();

// view engine setup
app.set('views', './views');
app.set('view engine', 'ejs');

//app.use(logger('dev'));
app.use(express.json());
//app.use(cookieParser());
app.use(express.static('./public'));



//app.use(bodyParser.json()) // for parsing application/json
//app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use(session({
  secret: 'tempdemo',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

app.get('/', async (req, res) => {
  

  const db = await getDb();
  const tenant = await db.collection('tenant').findOne({}) as unknown as TenentDefinition

  const sess = req.session as CustomSessionData;
  sess.tenant = tenant
  sess.history = [{ 
    role: "system", 
    content: tenant.aiSystemMessage + ". The categories of things we sell are " + (await db.collection('products').find({  partition_key: sess.tenant.partition_key, type:  "Category"}).toArray()).map(c => c.heading).join('and ') }]

  res.render('index', { tenant, imageBaseUrl });
});

app.get('/reset', function(req, res, next) {
  req.session.destroy(err => {
    res.setHeader('HX-Refresh', 'true')
    res.setHeader('HX-Redirect', '/')
    return res.end()//res.render('index', { tenant: app.get('tenant'), imageBaseUrl })
  })
});

// Question if browser should download from the storage account directly, or if the app should proxy the download
app.get('/file/*', async (req, res)  =>{
  const filepath = (req.params as { [key: string]: string })[0];
  try {
    const blobClient = containerClient.getBlobClient(filepath);
    const dl = await blobClient.download()
    dl.readableStreamBody?.pipe(res)
  } catch (e: any) {
    res.status(500).send(e.message);
  } 
})

app.get('/help', function(req, res, next) {
  res.render('help', { full: false });
});


app.get('/explore', async (req, res, next) => {
  const sess = req.session as CustomSessionData;
  const db = await getDb();
  const categories = await db.collection('products').find({  partition_key: sess.tenant.partition_key, type:  "Category"}).toArray()

  res.render('products', { categories, imageBaseUrl });
})

app.get('/explore/:category', async (req, res, next) => {
  const { category } = req.params;
  const sess = req.session as CustomSessionData;

  try {
    const db = await getDb();
    const categories = await db.collection('products').find({ partition_key: sess.tenant.partition_key, type:  "Product", category_id: new ObjectId(category)}).toArray()

    sess.history = [...(sess.history || []), { role: 'user', content: `I'm looking at ${categories.map(c => c.heading).join('and ')}`}]

    res.render('products', { categories, imageBaseUrl });
  } catch (error: any) {
    res.status(500).send(error);
  }
})

type Cart = {
  [key: string]: number
}


app.post('/add/:productid', async (req, res, next) => {
  const { productid } = req.params;
  const sess = req.session as CustomSessionData;

  try {
    const db = await getDb();
    const product = await db.collection('products').findOne({ partition_key: sess.tenant.partition_key, _id: new ObjectId(productid)})

    sess.cart = [{ product, quantity: 1}].concat(sess.cart || [])
    sess.history = [...(sess.history || []), { role: 'user', content: `I added ${product?.heading}  to my cart`}]


    res.render('textresponse', { question: "/add", answer: `${product?.heading} added to your cart` });


  } catch (error: any) {
    res.status(500).send(error);
  }
})

app.get('/cart', async (req, res, next) => {
  const sess = req.session as CustomSessionData;
  try {
      //const db = await getDb();
      //const cart = await db.collection('cart').find({}).toArray()
  
      res.render('cart', { cart: sess.cart, imageBaseUrl });
  } catch (error: any) {
      res.status(500).send(error);
  }
})


app.use('/api/chat', chatRouter)
//app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// catch all error handler
app.use((err: { message: any; status: any }, req: { app: { get: (arg0: string) => string } }, res: { locals: { message: any; error: any }; status: (arg0: any) => void; render: (arg0: string) => void }, next: any) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


async function main() {

  try { 

    const db = await getDb();
    const tenant = await db.collection('tenant').findOne({}) as unknown as TenentDefinition
    if (!tenant) {
      await initCatalog('setup/food.json')
    }
  

    var port = normalizePort(process.env.PORT || '3000');
    app.set('port', port);

    /**
     * Create HTTP server.
     */

    var server = http.createServer(app);

    /**
     * Listen on provided port, on all network interfaces.
     */

    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

    /**
     * Normalize a port into a number, string, or false.
     */

    function normalizePort(val : string) {
      var port = parseInt(val, 10);

      if (isNaN(port)) {
        // named pipe
        return val;
      }

      if (port >= 0) {
        // port number
        return port;
      }

      return false;
    }

    /**
     * Event listener for HTTP server "error" event.
     */

    function onError(error: any) {
      if (error.syscall !== 'listen') {
        throw error;
      }

      var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

      // handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          console.error(bind + ' requires elevated privileges');
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(bind + ' is already in use');
          process.exit(1);
          break;
        default:
          throw error;
      }
    }

    /**
     * Event listener for HTTP server "listening" event.
     */

    function onListening() {
      var addr = server.address();
      var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr?.port;
      console.debug('Listening on ' + bind);
    }
  } catch (error: any) {
    console.error(error);
  }
  
}

main()

