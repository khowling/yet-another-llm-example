"use server";

import { Suspense, cache } from "react";
import { getDb } from '../utils/getDb'
import { ObjectId } from 'bson'
import { CommandHelp } from "./messageTemplates";
import { ChatMeType } from "./feedLayout";

const getItem = cache(async (id: string) => {
  const db = await getDb();
  return await db.collection('products').findOne({ _id: new ObjectId(id) })
})

const getCategories = cache(async () => {
  const db = await getDb();
  return await db.collection('products').find({ type:  "Category"}).toArray()
})


export async function ExploreCategories() {

    const categories = await getCategories()

    return (
        <Suspense fallback={<p>Loading feed...</p>}>

          <div className="flex flex-row flex-wrap gap-5 ml-5 px-10 mt-5">
      
            { categories.map((i,idx) => 
              
              <div key={i.title} className="card bg-base-100 shadow-xl basis-60">
                <figure><img src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg" alt="Shoes" /></figure>
                <div className="card-body">
                  <h2 className="card-title">{i.heading}</h2>
                  <p>{i.description}</p>
                  <div className="card-actions justify-end">
                    
                    <CommandHelp command="/explore" type={ChatMeType.nav} component={ExploreCategories} componentProp={i.title} />
                  
                  </div>
                </div>
              </div>
            )}
          </div>
    
        </Suspense>
    )
}



  