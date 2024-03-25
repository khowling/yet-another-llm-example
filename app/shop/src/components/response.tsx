export default ({assistantMessage, assistantImageSrc}: {assistantMessage : JSX.Element, assistantImageSrc : string}) =>

    <div  class="flex items-end overflow-auto gap-1">
        <div class="avatar placeholder">
            <div class="text-neutral-content rounded-full w-8 border-warning">
            <img src={assistantImageSrc} alt="Bot" class="rounded-full w-10 h-10" />
            </div>
        </div> 

        <div class="chat chat-start" >
            <div class="chat-bubble chat-bubble-info">{assistantMessage}</div>
        </div>
    </div>

