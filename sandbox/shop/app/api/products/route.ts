

import { MongoClient } from 'mongodb'

const murl : string = process.env.AISHOP_MONGO_CONNECTION_STR || "mongodb://localhost:27017/azshop?replicaSet=rs0"
const client = new MongoClient(murl);

 
export const getDb = async () => {
    // Connect MongoDB
  await client.connect();
  return client.db();
}

export async function GET(request: Request) {
    const db = await getDb();
    return Response.json(await db.collection('products').find({ type:  "Category"}).toArray())

  }