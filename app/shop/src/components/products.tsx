
import { ProductOrCategory } from '../init_config'
import Command from './command'

export default ({categories, imageBaseUrl}: {categories :  Array<ProductOrCategory>, imageBaseUrl : string}) =>  

    <div class="flex flex-row flex-wrap gap-5 my-5">
        { categories.map((c, i) => 
        
            <div key={i} class="card bg-base-100 shadow-xl basis-60">
                <figure><img class="h-48 object-cover"  src={`${imageBaseUrl}/${c.image.pathname}`} alt="Shoes" /></figure>
                <div class="card-body">
                <h2 class="card-title">{c.heading}</h2>
                    <p>{c.description.substring(0, 80) }...</p>
                <div class="card-actions justify-end">
                    { c.type === 'Category' ?
                        <Command command='/explore'subcommand={c.heading} args={c._id}/>
                       : [
                        <Command method='post' command='/add' args={c._id}/>,
                        <Command command='/details'  args={c._id}/>
                       ]

                    }
                
                </div>
                </div>
            </div>
        )}
    </div>

