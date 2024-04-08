
import { ProductOrCategory } from '../init_config'
import Command from './command'


export default ({recipes, rheading, products, imageBaseUrl}: {recipes :  Array<ProductOrCategory>, rheading: string,  products :  Array<ProductOrCategory>, imageBaseUrl : string}) =>  

<div  class="flex items-end overflow-auto gap-1">
        

<div class="gap-x-0 chat chat-start" >
    <div class="chat-bubble bg-[#f8f9fa] text-black">

        <h1>{rheading}</h1>
        <div class="flex flex-row flex-wrap gap-5 my-5">
            { recipes.map((c, i) => 
            
                <div key={i} class="card bg-base-100 shadow-xl basis-60">
                    <figure><img class="h-48 object-cover"  src={`${imageBaseUrl}/${c.image.pathname}`} alt="Shoes" /></figure>
                    <div class="card-body">
                        <h2 class="card-title">{c.heading}</h2>
                            <p>{c.description.substring(0, 80) }...</p>
                        <div class="card-actions justify-end">
                            { c.type === 'Category' ? [
                                <Command command='/explore'subcommand={c.heading} args={c._id}/>,
                                <Command method='post' command='/add' subcommand={c.heading} args={c._id}/>,
                            ] : [
                                <Command method='post' command='/add' args={c._id}/>,
                                <Command command='/details'  args={c._id}/>
                            ]
                            }
                        </div>
                    </div>
                </div>
            )}
        </div>

        <h1>Or select from our related products</h1>
        <div class="flex flex-row flex-wrap gap-5 my-5">
        { products.map((c, i) => 

            <div key={i} class="card bg-base-100 shadow-xl basis-20">
                <figure><img class="h-24 object-cover"  src={`${imageBaseUrl}/${c.image.pathname}`} alt="Shoes" /></figure>
                <div class="card-body">
                    <p class="text-xs">{c.heading.substring(0, 20) }</p>
                    <div class="card-actions justify-end">
                        { c.type === 'Category' ?
                            <Command command='/explore'subcommand={c.heading} args={c._id}/>
                        : [
                            <Command method='post' command='/add' args={c._id}/>
                        ]

                        }
                    
                    </div>
                </div>
            </div>
        )}
        </div>
   </div>
</div>
</div>

