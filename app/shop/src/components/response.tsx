export default ({assistantMessage, assistantImageSrc}: {assistantMessage : JSX.Element, assistantImageSrc : string}) =>

    <div  class="flex items-end overflow-auto gap-1">
        <div class="avatar placeholder">
            <div class="text-neutral-content rounded-full w-8">
            <img src={assistantImageSrc} alt="Bot" class="rounded-full w-10 h-10" />
            </div>
        </div> 

        <div class="chat chat-start w-full" >
            <div class="chat-bubble bg-[#f8f9fa] text-slate-900 w-full">{assistantMessage}</div>
        </div>
    </div>

