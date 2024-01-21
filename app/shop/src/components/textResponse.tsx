import Command from "./command";

export default ({answer}: {answer :  string}) =>

    <div  class="flex items-end overflow-auto gap-1">
        <div class="avatar placeholder">
            <div class="text-neutral-content rounded-full w-8">
            <img src="https://randomuser.me/api/portraits/men/41.jpg" alt="Bot" class="rounded-full w-10 h-10" />
            </div>
        </div> 

        <div class="chat chat-start" >
            <div class="chat-bubble chat-bubble-info">{answer}, click <Command command='/cart'/> to view your cart</div>
        </div>
    </div>

