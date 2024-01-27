

export default ({chatid, question}: {chatid : string, question : string}) => 
    <>
    <div class="chat chat-end">
        <div class="chat-bubble">{question}</div>
    </div>

    <div  class="flex items-end overflow-auto gap-1">
        <div class="avatar placeholder">
            <div class="text-neutral-content rounded-full w-8">
                <img src="https://randomuser.me/api/portraits/men/41.jpg" alt="Bot" class="rounded-full w-10 h-10" />
            </div>
        </div> 

        <div class="chat chat-start" >
            <div id={`sse-response${chatid}`} hx-ext="sse" sse-connect={`/api/chat/completion/${chatid}`} class="chat-bubble chat-bubble-info" sse-swap={chatid} hx-swap="innerHTML show:#messages:bottom" hx-target={`find #stream${chatid}`}>
                <div sse-swap={`close${chatid}`} hx-swap="outerHTML show:#messages:bottom"  hx-target={`closest #sse-response${chatid}`}></div>
                <div style="width: fit-content;" id={`stream${chatid}`}></div>
            </div>
        </div>
    </div>
    </>
