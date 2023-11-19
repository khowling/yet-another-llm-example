import { useState, useRef, useEffect } from "react";

export default function Chat() {

  const chatContainer = useRef(null);

  const [chatme, setChatme] = useState([{type: "llm", text: "You underestimate my power!"}, {type: "me", text: "It's over Anakin, I have the high ground."}])

  const handleKeyDown = (event: any) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        setChatme((prev) => [...prev, {type: "me", text: event.target.value}]);
        event.target.value = null
      }
  };

  useEffect(() => {
    if (chatContainer.current) {
      chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
    }
  }, [chatme]);

  return (
      <div className="w-1/2 overflow-y-scroll relative pb-20"  ref={chatContainer}>

        { chatme.map((i,idx) => {
          return i.type === "llm" ?
              
              <div key={idx} className="flex items-end overflow-auto gap-1 ml-3">
                <div className="avatar placeholder">
                  <div className="text-neutral-content rounded-full w-8">
                  <img src="https://randomuser.me/api/portraits/men/41.jpg" alt="Bot" className="rounded-full w-10 h-10" />
                  </div>
                </div> 

                <div className="chat chat-start">
                  <div className="chat-bubble">It's over Anakin, <br/>I have the high ground.</div>
                </div>
              </div>
              :  
              <div key={idx}  className="chat chat-end mr-3">
                <div className="bg-primary  chat-bubble">You underestimate my power!</div>
              </div>
              
        })}
   
        <div className="fixed bottom-5 w-2/5  px-5">
          <input type="text" placeholder="Type here" className="input input-bordered input-primary w-full " onKeyDown={handleKeyDown}/>
        </div>
      </div>
  );
 }