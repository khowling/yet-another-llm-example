import { ObjectId } from "mongodb"
import { type TenantDefinition } from "../init_config"

export default ({tenant, command, subcommand, method, args}: {tenant: TenantDefinition , command : string, subcommand?: string, method?: string, args?: ObjectId}) => {
    const spanAttributes = {
        "class": subcommand? `btn h-auto  border-[${tenant.buttonColor}] bg-base-100 p-1.5 min-h-0` : `btn bg-[${tenant.buttonColor}] text-white min-h-fit h-auto p-2`,
        [`hx-${method || 'get'}`]: args? command+'/'+args : command,
        "hx-target": "#messages",
        "hx-swap": "beforebegin show:bottom"
    }
    if (!subcommand) return (<span {...spanAttributes}>{command}</span>)

    return (
        <span {...spanAttributes}>
            <span class={`btn bg-[${tenant.buttonColor}] text-white min-h-fit h-auto p-1`} >{command}</span>
            <span>{subcommand}</span>
        </span>
    )

    
}

