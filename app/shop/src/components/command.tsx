import { ObjectId } from "mongodb"

export default ({command, subcommand, method, args}: {command : string, subcommand?: string, method?: string, args?: ObjectId}) => {
    const spanAttributes = {
        "class": subcommand? "btn h-auto border-orange bg-base-100 p-1.5 min-h-0" : "btn btn-primary min-h-fit h-auto p-2 command-border text-white",
        [`hx-${method || 'get'}`]: args? command+'/'+args : command,
        "hx-target": "#messages",
        "hx-swap": "beforebegin show:bottom"
    }
    if (!subcommand) return (<span {...spanAttributes}>{command}</span>)

    return (
        <span {...spanAttributes}>
            <span class="command-border btn btn-primary min-h-fit h-auto p-1 text-white" >{command}</span>
            <span>{subcommand}</span>
        </span>
    )

    
}

