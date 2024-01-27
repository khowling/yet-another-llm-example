import Command from "./command";

export default ({full, imageBaseUrl}: {full : boolean, imageBaseUrl : string}) => 

      <div key="Help1" class="chat chat-start ">
        <div class="chat-image avatar">
        <div class="w-8 rounded-full">
            <img alt="Tailwind CSS chat bubble component" src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
        </div>
        </div>
    
        <div class="chat-bubble chat-bubble-info">
        <div class="">Hi, Im Billy, your guide, type <Command command='/explore'/> or <Command command='/cart'/>  at any time. or... just chat to me, like normal, I can be very helpful
        </div>      
        </div>
    </div>
