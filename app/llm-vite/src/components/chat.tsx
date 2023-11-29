import { useState, useRef, useEffect, Suspense, createElement, createContext, useContext } from "react";
import FileList from "./FileList";
import FileUploadClient from "./FileUpload";


enum ChatMeType {
  llm = "llm",
  me = "me",
  nav = "nav"
}

type ChatMe = {
  type: ChatMeType,
  text?: string,
  command?: string,
  component?: any
  componentProp?: string
};


export const MyChatContext = createContext<(chat: ChatMe) => void>((chat)  => {} );

export function FileUpload() {
  return (
    <div className="card  md:basis-2/5 grow basis-full  shadow-2xl bg-base-100">
    <Suspense fallback={<div>Loading...</div>}>
      <FileList/>
    </Suspense>
    <FileUploadClient/>
</div>
  )
}


function ShopLanding() {
  return ([

    <div key={1} className="chat chat-start ml-5">
      <div className="chat-image avatar">
        <div className="w-8 rounded-full">
          <img alt="Tailwind CSS chat bubble component" src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
        </div>
      </div>
      <div className="chat-bubble">type <CommandHelp command="/all" type={ChatMeType.nav} component={ShopLanding} />  at any time to start navigating our catalog, or press <CommandHelp command="/help" type={ChatMeType.nav} component={Help} />  </div>
    </div>,


    <div key={6} className="flex flex-row flex-wrap gap-5 ml-5 px-10 mt-5">

      { [{title: "shoes"},{title: "bikes"},{title: "phones"}].map((i,idx) => 
        
        <div key={idx} className="card bg-base-100 shadow-xl basis-60">
          <figure><img src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg" alt="Shoes" /></figure>
          <div className="card-body">
            <h2 className="card-title">{i.title}</h2>
            <p>If a dog chews shoes whose shoes does he choose?</p>
            <div className="card-actions justify-end">
              
              <CommandHelp command="/explore" type={ChatMeType.nav}  componentProp={i.title} />
             
            </div>
          </div>
        </div>
      )}

      

    </div>
  ])
}

function CommandHelp({command, component, componentProp } : ChatMe) {

  
  const pushChat = useContext(MyChatContext);

  const cmdOut = <span className={`btn btn-primary min-h-fit h-auto p-${componentProp ? '1' : '2'}`}  onClick={() => { console.log ('push') ; pushChat({type: ChatMeType.nav, command, component, componentProp})}}>{command}</span>
  return componentProp === undefined ? cmdOut : <span className="btn min-h-fit h-auto p-1 border-primary bg-base-100 pr-2">{cmdOut}{componentProp}</span>
}

function Help() {

  return ([


    <div key={1}  className="chat chat-end mr-3">
      <div className="bg-primary  chat-bubble">/help</div>
    </div>,


    <div key={2} className="flex flex-row flex-wrap gap-5 ml-5 px-10 mt-5">
      <div className="card card-side bg-base-100 shadow-xl">
        <figure><img src="https://daisyui.com/images/stock/photo-1635805737707-575885ab0820.jpg" alt="Movie"/></figure>
        <div className="card-body">

          <table className="table-fixed border-separate border-spacing-y-1.5 border-spacing-x-1">
            <thead>
              <tr>
                <th></th>
                <th className="text-left">shopping stuff</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><CommandHelp command="/all" type={ChatMeType.nav} component={ShopLanding}/></td><td>navigate all products we have to offer</td></tr>
              <tr><td><CommandHelp command="/sale" type={ChatMeType.nav} /></td><td>whats on sale</td></tr>
              <tr><td><CommandHelp command="/me" type={ChatMeType.nav}/></td><td>our personally shopper AI will look after you!</td></tr>
              <tr><td><CommandHelp command="/cart" type={ChatMeType.nav}/></td><td>see your shopping cart</td></tr>
              <tr><td><CommandHelp command="/saved" type={ChatMeType.nav}/></td><td>see your saved items</td></tr>
            </tbody>
            <thead>
              <tr>
                <th></th>
                <th className="text-left">account stuff</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><CommandHelp command="/orders" type={ChatMeType.nav}/></td><td>show all the products we have to offer</td></tr>
              <tr><td><CommandHelp command="/pay" type={ChatMeType.nav}/></td><td>see your payment methods</td></tr>
            </tbody>
          </table>
          
        </div>
      </div>
    </div>

  ])
}


 export default function Chat() {
  const chatContainer = useRef<HTMLDivElement>(null);


  // State for keeping track of our Navigation/Conversation, then make it available to as a Global Context
  const [chatme, setChatme] = useState<Array<ChatMe>>([{type: ChatMeType.nav, component: ShopLanding}])

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
    <MyChatContext.Provider value={pushChat}>

        <div id="cib-serp-main" className="absolute h-full w-full flex z-0">

          <div id="cib-conversation-main" className="flex relative h-full w-full overflow-y-scroll flex-col flex-1 z-0"  ref={chatContainer}>

              {/* padding top and botton to make space for the action bar and input */}
              <div className="content pt-28 pb-24 -z-1">

                { chatme.map((i,idx) => {
                  return i.type === "nav" ? (
                  
                       createElement(i.component, {key: idx, ...i.componentProp && {componentProp: i.componentProp}})
                 ) :
                        i.type === "llm" ?
                      
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
              </div>
          </div>


          <div id="cib-action-bar" className="absolute bottom-0 flex w-full  bg-base-100 transition-opacity">

            <div className="px-16 mb-6 mt-4 w-full">

              <div className="join w-full">
              
                <div tabIndex={0} role="button" className="btn m-0 btn btn-primary join-item" onClick={() => pushChat({type: ChatMeType.nav, component: Help})}>/help</div>
                  

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
   
      </MyChatContext.Provider>
  );
 }