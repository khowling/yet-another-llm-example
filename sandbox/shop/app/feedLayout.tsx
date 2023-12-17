"use client";

import { Reducer, createContext, createElement, type Dispatch, useContext, useEffect, useReducer, useRef, useState } from "react";

import { ShopLanding, Help } from './messageTemplates'

export enum ChatMeType {
    llm = "llm",
    me = "me",
    nav = "nav"
}
  
export type ChatMe = {
    ref?: string,
    type?: ChatMeType,
    text?: string,
    command?: string,
    component?: any
    componentProp?: string
};
  
  
  function FormInput() {
  
    const [input, setInput] = useState('');
    const dispatch = useContext(FeedContext);
 
    function help() {
      dispatch({type: ReducerActionType.push, chat: {type: ChatMeType.nav, component: Help}});
    } 

    const handleInputChange = (e: any) => {
        setInput(e.target.value);
      };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        console.log (`handleSubmit ${input}`)
        if (!input) return;
        //pushMessage({type: ChatMeType.me, text: input});
        dispatch({type: ReducerActionType.push, chat: {type: ChatMeType.me, text: input}});

        setInput('');

        await fetchData( [
          { role: "system", content: "You are a helpful assistant. You will talk like a pirate." },
          { role: "user", content: input }
      ]);
    }

  

  const fetchData = async (messages: Array<{role: string, content: string}>) => {

    const ref = Date.now()+''+Math.floor(Math.random()*999)
    //pushMessage({ref, type: ChatMeType.llm, text: 'thinking...'});
    dispatch({type: ReducerActionType.push, chat: {ref, type: ChatMeType.llm, text: 'thinking...'}});
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

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
 
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            //setLoading(false);
            break;
          }
          const decodedChunk = decoder.decode(value, { stream: true });
          //appendMessage(ref, decodedChunk);
          dispatch({type: ReducerActionType.append, chat: {ref, text: decodedChunk}});
        }
    } catch (e) {
      //appendMessage(ref, `${e.error}: ${e.message}`);
      dispatch({type: ReducerActionType.append, chat: {ref, text: `${e.error}: ${e.message}`}});
      console.error(e);
    // Handle other errors
    }
  };
  
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
  

//export const FeedContext = createContext<[(chat: ChatMe) => void, (ref: string, text: string) => void]>([(chat)  => {}, (ref, text) => {} ]);

export const FeedContext = createContext<Dispatch<{ type: ReducerActionType, chat: ChatMe }>>(() => {});

export enum ReducerActionType {
  push = "push",
  append = "append"
}

type ReducerInterface = (prevState: Array<ChatMe>, action: {type: ReducerActionType, chat: ChatMe }) => Array<ChatMe>

export function reducer(prevState: Array<ChatMe>, action: {type: ReducerActionType, chat: ChatMe }) : Array<ChatMe>{
  console.log (`reducer ${JSON.stringify(action)}`)
  switch (action.type) {
    case ReducerActionType.push:
      return [...prevState, action.chat.ref ? action.chat : {...action.chat, ref: 'l'+prevState.length}];
    case ReducerActionType.append:
      const index = prevState.findIndex(c => c.ref === action.chat.ref)
      if (index > -1) {
        return [...prevState.slice(0, index), ...([{...prevState[index], text: prevState[index].text+action.chat.text}]), ...prevState.slice(index + 1)]
      } else {
        console.error(`appendMessage: ref ${action.chat.ref} not found`)
        return prevState
      }  
    
    default:
      throw new Error();
  }

}


export default function FeedLayout() {
    
    //const [messages, setMessages] = useState<Array<ChatMe>>([{ref: 'start', type: ChatMeType.nav, component: ShopLanding}]);
    const [messages, dispatch] = useReducer<Reducer<Array<ChatMe>,  {type: ReducerActionType, chat: ChatMe }>>(reducer, [{ref: 'start', type: ChatMeType.nav, component: ShopLanding}]);

    const chatContainer = useRef<HTMLDivElement>(null);

    console.log (`render ${JSON.stringify(messages)}`)

    useEffect(() => {
      if (chatContainer.current) {
        chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
      }
    });

  
    return (
      <FeedContext.Provider value={dispatch}>
        <div id="cib-serp-main" className="absolute h-full w-full flex z-0">
          <div id="cib-conversation-main" className="flex relative h-full w-full overflow-y-scroll flex-col flex-1 z-0"  ref={chatContainer}>
            <div className="content pt-28 pb-24 -z-1">
              {messages.map((i) => {
                  return  i.type === ChatMeType.llm ?
                
                      <div key={i.ref} className="flex items-end overflow-auto gap-1 ml-3">
                        
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
                        i.type === ChatMeType.nav ?
                          createElement(i.component, {key: i.ref, ...i.componentProp && {componentProp: i.componentProp}})
                      :
                      <div key={i.ref}  className="chat chat-end mr-3">
                        <div className="bg-primary  chat-bubble">{i.text}</div>
                      </div>
              })}
            
            </div>
          </div>
          <FormInput/>
        </div>
      </FeedContext.Provider>
    )
  }