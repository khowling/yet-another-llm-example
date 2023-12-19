import * as mongoDB from "mongodb";
import { ObjectId } from 'bson'
import { Readable } from 'stream';

import { DefaultAzureCredential,  } from '@azure/identity';
import { BlobServiceClient, StorageSharedKeyCredential, BlockBlobClient } from "@azure/storage-blob"

const IMAGE_CONTAINER = process.env.IMAGE_CONTAINER || 'images'

const blobServiceClient = new BlobServiceClient(
    process.env.STORAGE_ACCOUNT ?  `https://${process.env.STORAGE_ACCOUNT}.blob.core.windows.net` : 'https://127.0.0.1:10000/devstoreaccount1',
    new DefaultAzureCredential()
  );


// function getFileClient(store : string, filename: string) : BlockBlobClient {
//     const extension = encodeURIComponent(filename.substring(1 + filename.lastIndexOf(".")))
//     const pathname = `${store}/${(new ObjectId()).toString()}.${extension}`

//     return containerClient.getBlockBlobClient(pathname);
// }

async function writeimages(partition_key : string, images: { [pathname: string]: string}) {

    const fileregex = /.+\.([^.]+$)/
    const containerClient = blobServiceClient.getContainerClient(IMAGE_CONTAINER);
    // Cleardown, then Create the container, allowing public access to blobs

    await containerClient.createIfNotExists({access: 'blob'});

    const existingBlobs = containerClient.listBlobsFlat();
    // now delete existing blobs
    for await (const blob of existingBlobs) {
        console.log(`Deleting blob ${blob.name}`);
        await containerClient.deleteBlob(blob.name);
    }

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

import { images, products } from './bikes.json'
//import { TenentContext } from "../shop/ui/src/GlobalContexts";

async function populateTenent(db: mongoDB.Db, partition_key: string): Promise<void> { 

    const { Product, Category } = products

    const imagemap = await writeimages(partition_key, images)

    const catmap = new Map()
    const newcats = Category.map(function (c) {
        console.log(`populateTenent: Processing catalog ${c.heading}`)
        const old_id = c._id, new_id = new ObjectId()//.toHexString()
        const newc = { ...c, _id: new_id, partition_key: partition_key, creation: Date.now() }
        if (c.image && c.image.pathname) {
            newc.image = imagemap.get(c.image.pathname)
            if (!newc.image) {
                console.error(`Cannot find image pathname ${c.image.pathname}`)
            }
        }
        catmap.set(old_id, new_id)
        return newc
    })

    console.log (`Clearning down all products and categories..`)
    await db.collection('products').deleteMany({partition_key: partition_key })

    console.log(`Loading Categories : ${JSON.stringify(newcats)}`)
    await db.collection('products').insertMany(newcats)

    const newproducts = Product.map(function (p) {
        console.log(`Processing product ${p.heading}`)
        const old_id = p._id, new_id = new ObjectId()//.toHexString()
        const newp = { ...p, _id: new_id, partition_key: partition_key, creation: Date.now() }
        if (p.category_id) {
            newp.category_id = catmap.get(p.category_id)
            if (!newp.category_id) {
                console.error(`Cannot find category ${p.category_id}`)
            }
        }
        if (p.image && p.image.pathname) {
            newp.image = imagemap.get(p.image.pathname)
            if (!newp.image) {
                console.error(`Cannot find image pathname ${p.image.pathname}`)
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



async function main(): Promise<void> {

    const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DB_CONN_STRING || 'mongodb://localhost:27017/azshop');
    
    try {
        await client.connect();
        const db: mongoDB.Db = client.db(process.env.DB_NAME);
        console.log('Connected to the database, creating local developer tenent');
        
        
        //console.log(`tear down existing config`)
        //await db.collection('business').deleteMany({partition_key: partition_key })

    
        // Create new details.
        //const new_tenent = await db.collection('business').insertOne({ ...tenent_def, type: "business", partition_key: partition_key })
        
        // Perform database operations here
        await populateTenent(db, PARTITION_KEY);

    } catch (error) {
        console.error('Error connecting to the database:', error);
    } finally {
        await client.close();
        console.log('Disconnected from the database');
    }
}


main()

