// https://learn.microsoft.com/en-us/azure/service-connector/how-to-integrate-cosmos-db?tabs=nodejs#sample-code-2

import * as mongoDB from "mongodb"
import { ObjectId } from 'bson'
import { Readable } from 'stream'
import fs from 'node:fs/promises'

import { DefaultAzureCredential,  } from '@azure/identity';
import { BlobServiceClient, StorageSharedKeyCredential, BlockBlobClient } from "@azure/storage-blob"
import path from 'node:path'


const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.AISHOP_MONGO_CONNECTION_STR || 'mongodb://localhost:27017/azshop');

const blobServiceClient = new BlobServiceClient(
    process.env.AISHOP_STORAGE_ACCOUNT ?  `https://${process.env.AISHOP_STORAGE_ACCOUNT}.blob.core.windows.net` : 'https://127.0.0.1:10000/devstoreaccount1',
    new DefaultAzureCredential()
  );

const containerClient = blobServiceClient.getContainerClient(process.env.AISHOP_IMAGE_CONTAINER || 'images');


async function writeimages(partition_key : string, images: { [pathname: string]: string}) {

    const fileregex = /.+\.([^.]+$)/
    
    let imagemap = new Map()
    for (const pathname of Object.keys(images)) {

        const b64 = Buffer.from(images[pathname], 'base64'),
            bstr = b64.toString('utf-8'),
            file_stream = Readable.from(bstr),
            extension = pathname.match(fileregex)?.[1],
            filepath = `${partition_key}/${(new ObjectId()).toString()}.${extension}`

        if (extension) {
            console.log(`writeimages writing ${filepath}`);
            const bbClient = containerClient.getBlockBlobClient(filepath);
            
            try {
                await bbClient.uploadData(b64, {
                    blobHTTPHeaders: { blobContentType: `image/${extension}` },
                    //abortSignal: AbortController.timeout(30 * 60 * 1000), // Abort uploading with timeout in 30mins
                    onProgress: (ev) => console.log(ev)
                });
                //await bbClient.uploadStream(file_stream, {
                //    blobHTTPHeaders: { blobContentType: `image/${extension}` },
                //    //abortSignal: AbortController.timeout(30 * 60 * 1000), // Abort uploading with timeout in 30mins
                //    onProgress: (ev) => console.log(ev)
                //});
                console.log(`uploadStream succeeds, got ${bbClient.name}`);
                imagemap.set(pathname, { pathname: bbClient.name })
            } catch (err: any) {
                console.log(
                `uploadStream failed, requestId - ${err.details.requestId}, statusCode - ${err.statusCode}, errorCode - ${err.details.errorCode}`
                );
            }
        } else {
            console.error(`writeimages: cannoot find extension of image name ${pathname}`)
        }

    }
    return imagemap
}


//import { images, products } from './bikes.json'
//import { TenentContext } from "../shop/ui/src/GlobalContexts";

type ProductOrCategory = {
    _id: string,
    type: "Product" | "Category",
    heading: string,
    description: string,
    category_id?: string,
    image: { 
        pathname?: string, 
        err?: any 
    }
}

type Catalog = {
    images: { [pathname: string]: string },
    products: {
        Product: Array<ProductOrCategory>,
        Category: Array<ProductOrCategory>
    }
}

async function populateTenent(db: mongoDB.Db, partition_key: string, catalogData: Catalog, catalogFilePath: string): Promise<void> { 

    const { Product, Category } = catalogData.products

    // Cleardown, then Create the container, allowing public access to blobs

    await containerClient.createIfNotExists({access: 'blob'});

    const existingBlobs = containerClient.listBlobsFlat();
    // now delete existing blobs
    for await (const blob of existingBlobs) {
        console.log(`Deleting existing old blob ${blob.name}`);
        await containerClient.deleteBlob(blob.name);
    }

    const imagemap = await writeimages(partition_key, catalogData.images)

    // async loop through the categories, creating new categories and products
    for (const c of [...Category, ...Product]) {
        if (c.image && c.image.pathname) {
            if (!imagemap.has(c.image.pathname)) {
                try {
                    const filepath = `${catalogFilePath}/${c.image.pathname}`
                    const blobpath = `${partition_key}/${c.image.pathname}`
                    const blockBlobClient = containerClient.getBlockBlobClient(blobpath);
                    console.log(`populateTenent: Uploading image ${filepath}`)
                    await blockBlobClient.uploadFile(filepath);
                    imagemap.set(c.image.pathname, { pathname: blobpath })
                } catch (err: any) {
                    console.error(`Cannot upload image pathname ${c.image.pathname} : ${JSON.stringify(err)}}`)
                }
            }
        }
    }

    const catmap = new Map()
    const newcats = Category.map((c) => {
        console.log(`populateTenent: Processing catalog ${c.heading}`)
        const old_id = c._id, new_id = new ObjectId()//.toHexString()
        const newc = { ...c, _id: new_id, partition_key: partition_key, creation: Date.now() }
        if (c.image && c.image.pathname) {
            if (imagemap.has(c.image.pathname)) {
                newc.image = imagemap.get(c.image.pathname)
            } else  {
                console.error(`Cannot find image for Category ${c.heading}:  ${c.image.pathname}`)
            }
        }
        catmap.set(old_id, new_id)
        return newc
    })

    console.log (`Clearning down all products and categories..`)
    await db.collection('products').deleteMany({partition_key: partition_key })

    console.log(`Loading Categories : ${JSON.stringify(newcats)}`)
    await db.collection('products').insertMany(newcats)

    const newproducts = Product.map((p) => {
        console.log(`Processing product ${p.heading}`)
        const old_id = p._id, new_id = new ObjectId()//.toHexString()
        const newp = { ...p, _id: new_id, partition_key: partition_key, creation: Date.now() }
        if (p.category_id) {
            newp.category_id = catmap.get(p.category_id)
            if (!newp.category_id) {
                console.error(`Cannot find category for product  ${p.heading}:  ${p.category_id}`)
            }
        }
        if (p.image && p.image.pathname) {
            if (imagemap.has(p.image.pathname)) {
                newp.image = imagemap.get(p.image.pathname)
            } else  {
                console.error(`Cannot find image for Product ${p.heading}:  ${p.image.pathname}`)
            }

        }
        return newp
    })

    console.log("Importing Products")
    await db.collection('products').insertMany(newproducts)
/*
    if (value.inventory) {
        await ctx.db.collection(StoreDef["inventory"].collection).insertMany(newproducts.map(function (p) {
            return {
                _ts: new Timestamp(0,0), // Empty timestamp will be replaced by the server to the current server time
                partition_key: new_tenent.insertedId,
                status: 'Required',
                product_id: p._id,
                category_id: p.category_id,
                warehouse: 'EMEA',
                qty: 1
            }
        }))
    }
*/
}

    



const PARTITION_KEY = 'root'
interface TenentContext {
    name: string;
    image: { url: string };
    inventory: boolean;
    catalog: string;
}

const tenent_def: TenentContext = {
    name: process.argv[2] || "Developer Local Test Store",
    image: { url: process.argv[3] || 'https://assets.onestore.ms/cdnfiles/onestorerolling-1511-11008/shell/v3/images/logo/microsoft.png' },
    inventory: true,
    catalog: 'bike'
}



async function main(catalogfile: string): Promise<void> {
    
    try {
        await client.connect();
        const db: mongoDB.Db = client.db(process.env.DB_NAME);
        console.log('Connected to the database, creating local developer tenent');
        
        const catalogFilePath = path.dirname(catalogfile)
        const catalogData = JSON.parse(await fs.readFile(catalogfile, 'utf-8'))

        console.log(`Using Catalog file ${catalogfile} (relative path: ${catalogFilePath})`)
        //await db.collection('business').deleteMany({partition_key: partition_key })

    
        // Create new details.
        //const new_tenent = await db.collection('business').insertOne({ ...tenent_def, type: "business", partition_key: partition_key })
        
        // Perform database operations here
        await populateTenent(db, PARTITION_KEY, catalogData, catalogFilePath);

    } catch (error) {
        console.error('Error connecting to the database or accessing the catalog file:', error);
    } finally {
        await client.close();
        console.log('Disconnected from the database');
    }
}

// Get the command line argument
const arg = process.argv[2];

if (!arg) {
    console.error('Usage: node init_config.js <catalogfile.json>');
    process.exit(1);
}

main(arg)

