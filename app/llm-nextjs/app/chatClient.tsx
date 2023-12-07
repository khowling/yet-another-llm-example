"use client";

import React, { Suspense, useRef, useState, useEffect } from "react"

import { ShopLanding, OpenAIResponse, ServerData } from "./serverData";



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
  
export default function ChatClient({children}: { children: React.ReactNode}) {
    const chatContainer = useRef<HTMLDivElement>(null);
  
    // State for keeping track of our Navigation/Conversation, then make it available to as a Global Context
    const [chatme, setChatme] = useState<Array<ChatMe>>([{type: ChatMeType.nav, command: '/all', component: ShopLanding}])
  
    const pushChat = (chat: ChatMe) => {
      console.log (`pushChat ${chat.type} ${chat.text}`)
      setChatme((prev) => [...prev, chat]);
    }
  
    const handleKeyDown = (event: any) => {
        if (event.key === '/') {
          event.preventDefault();
          pushChat({type: ChatMeType.me, text: event.target.value});
          
        }
    };
  
    useEffect(() => {
      if (chatContainer.current) {
        chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
  
      }
    }, [chatme]);

  
    return (
  
          <div id="cib-serp-main" className="absolute h-full w-full flex z-0">
  
            <div id="cib-conversation-main" className="flex relative h-full w-full overflow-y-scroll flex-col flex-1 z-0"  ref={chatContainer}>
  
                {/* padding top and botton to make space for the action bar and input 
                    <div className="content pt-28 pb-24 -z-1">
                    
                        { chatme?.map((ask,i) => 
                            <Suspense fallback={<p>Loading feed...</p>} key={`${i}1sus`}>
                                <OpenAIResponse key={`${i}4`} asks={ask.command}/>
                            </Suspense>
                        )}
                    </div>
                */}

                <div className="content pt-28 pb-24 -z-1">
                
                   <OpenAIResponse key={`4`} asks="ergerg"/> 
                    
                  
                </div>
            </div>
  
  
            <div id="cib-action-bar" className="absolute bottom-0 flex w-full  bg-base-100 transition-opacity">
  
              <div className="px-16 mb-6 mt-4 w-full">
  
                <div className="join w-full">
                
                  <div tabIndex={0} role="button" className="btn m-0 btn btn-primary join-item" onClick={() => pushChat({type: ChatMeType.nav, command: "/help"})}>/help</div>
                    
  
                  <div className="dropdown dropdown-top w-full">
                    <input type="text" placeholder="select '/' action of ask me a question here" className="input input-bordered  join-item input-primary w-full" onKeyDown={handleKeyDown}/>
                    <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 w-52">
                      <li><a>/products</a></li>
                      <li><a>/sales</a></li>
                      <li><a>/myorders</a></li>
                    </ul>
                  </div>
                  
                </div>
  
              </div>
  
            </div>
  
          </div>
     
  
    );
   }
