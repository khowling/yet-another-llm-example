"use client";

import { useCallback, useEffect, useRef, useState } from "react";


export enum ChatMeType {
    llm = "llm",
    me = "me",
    nav = "nav"
  }
  
  export type ChatMe = {
    type: ChatMeType,
    text?: string,
    command?: string,
    component?: any
    componentProp?: string
  };
  
  
  function FormInput({newSubmit}) {
  
    const [input, setInput] = useState('');
    
 
    function help() {
        console.log("help")
        // mutate data
        // revalidate cache
    } 

    const handleInputChange = (e: any) => {
        setInput(e.target.value);
      };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        console.log (`handleSubmit ${input}`)
        if (!input) return;
        await newSubmit(input)
        setInput('');
    }
  
    return (
      <div id="cib-action-bar" className="absolute bottom-0 flex w-full  bg-base-100 transition-opacity">
  
      <div className="px-16 mb-6 mt-4 w-full">
  
        <div className="join w-full">
        
          <div tabIndex={0} role="button" className="btn m-0 btn btn-primary join-item" onClick={help}>/help</div>
            
  
          <form onSubmit={handleSubmit} className="dropdown dropdown-top w-full">
            <input type="text" placeholder="select '/' action of ask me a question here" className="input input-bordered  join-item input-primary w-full" value={input} onChange={handleInputChange}/>
            {/*<ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 w-52">
              <li><a>/products</a></li>
              <li><a>/sales</a></li>
              <li><a>/myorders</a></li>
    </ul> */}
          </form>
          
        </div>
  
      </div>
  
    </div>
    )
  }
  

export default function FeedLayout() {
    const [messages, setMessages] = useState<ChatMe[]>([]);

    const chatContainer = useRef<HTMLDivElement>(null);

    
    useEffect(() => {
      if (chatContainer.current) {
        chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
      }
    });

    const handleSubmit = async (cmd: string) => {
          
        setMessages(prev => [...prev, {type: ChatMeType.me, text: cmd}]);

        await fetchData( [
            { role: "system", content: "You are a helpful assistant. You will talk like a pirate." },
            { role: "user", content: cmd }
        ]);

        return
    }
      
    

      const fetchData = async (messages: Array<{role: string, content: string}>) => {
        try {
        
          //const abortController = new AbortController();
        const response = await fetch('/api/chat', {
            method: 'POST',
            body: JSON.stringify(messages),
            headers: {
                'Content-Type': 'application/json'
            },
            //signal: abortController?.()?.signal
        });

        if (!response.ok || !response.body) {
            console.log(response.statusText);
            throw response.statusText;
        }

          setMessages(prev => [...prev, {type: ChatMeType.llm, text: 'thinking...'}]);
   
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
   
          while (true) {
            const { value, done } = await reader.read();
            if (done) {
              //setLoading(false);
              break;
            }
   
            const decodedChunk = decoder.decode(value, { stream: true });
            setMessages(prev => [...prev.slice(0,-1), {...prev.slice(-1)[0], text: prev.slice(-1)[0].text + decodedChunk}]);
          }
        } catch (error) {
          console.error(error);
          // Handle other errors
        }
      };
  
    return (
      <div id="cib-serp-main" className="absolute h-full w-full flex z-0">
        <div id="cib-conversation-main" className="flex relative h-full w-full overflow-y-scroll flex-col flex-1 z-0"  ref={chatContainer}>
          <div className="content pt-28 pb-24 -z-1">
            {messages.map((i,idx) => {
                 return  i.type === "llm" ?
               
               <div key={idx} className="flex items-end overflow-auto gap-1 ml-3">
                 <div className="avatar placeholder">
                   <div className="text-neutral-content rounded-full w-8">
                   <img src="https://randomuser.me/api/portraits/men/41.jpg" alt="Bot" className="rounded-full w-10 h-10" />
                   </div>
                 </div> 

                 <div className="chat chat-start">
                   <div className="chat-bubble">{i.text}</div>
                 </div>
               </div>
               :  
               <div key={idx}  className="chat chat-end mr-3">
                 <div className="bg-primary  chat-bubble">{i.text}</div>
               </div>
            })}
          
          </div>
        </div>
        <FormInput newSubmit={handleSubmit}/>
      </div>
    )
  }