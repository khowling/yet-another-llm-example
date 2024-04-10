
import { ProductOrCategory, type TenantDefinition } from '../init_config'
import Command from './command'

export default ({tenant, categories, imageBaseUrl, size = 'M'}: {tenant: TenantDefinition, categories :  Array<ProductOrCategory>, imageBaseUrl : string, size?: 'S' | 'M' | 'L'}) =>  

    <div class="flex flex-row flex-wrap gap-5 my-5">
        { categories.map((c, i) => 
        
            <div key={i} class={`card bg-base-100 shadow-xl basis-${size === 'S' ? '40' : size === 'M' ? '50' : '60'}`}>
                <figure><img class={`h-${size === 'S' ? '24' : size === 'M' ? '40' : '48'} object-cover`}  src={`${imageBaseUrl}/${c.image.pathname}`} alt="" /></figure>
                <div class="card-body">
                { size === 'S' || size === 'M' ? 
                        <p class="text-sm">{c.description.substring(0, 20) }</p> 
                        : [
                        <h2 class="card-title">{c.heading}</h2>,
                        <p>{c.description.substring(0, 80) }...</p>
                        ]
                }
                <div class="card-actions justify-end">
                    { c.type === 'Category' ?
                        <Command  tenant={tenant} command='/explore'subcommand={c.heading} args={c._id}/>
                       : [
                        <Command  tenant={tenant} method='post' command='/add' args={c._id}/>,
                        <Command  tenant={tenant} command='/details'  args={c._id}/>
                       ]

                    }
                
                </div>
                </div>
            </div>
        )}
    </div>

