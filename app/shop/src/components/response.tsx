export default ({assistantMessage, assistantImageSrc}: {assistantMessage : JSX.Element, assistantImageSrc : string}) =>

    <div  class="flex items-end overflow-auto gap-1">
        

        <div class="gap-x-0 chat chat-start" >
            <div class="chat-bubble bg-[#f8f9fa] text-black">{assistantMessage}</div>
        </div>
    </div>

