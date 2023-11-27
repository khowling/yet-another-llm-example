import React, { useState, useRef, useEffect, Suspense, createElement } from "react";
import FileList from "./FileList";
import FileUploadClient from "./FileUpload";


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

    <div className="chat chat-start ml-5">
      <div className="chat-image avatar">
        <div className="w-8 rounded-full">
          <img alt="Tailwind CSS chat bubble component" src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
        </div>
      </div>
      <div className="chat-bubble">type <span className="btn-primary p-1">/all</span> at any time to start navigating our catalog, or press <span className="btn-primary p-1">/help</span> </div>
    </div>,


    <div key={6} className="flex flex-row flex-wrap gap-5 ml-5 px-10 mt-5">

      { [1,2,3].map((i) => 
        
        <div className="card bg-base-100 shadow-xl basis-60">
          <figure><img src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg" alt="Shoes" /></figure>
          <div className="card-body">
            <h2 className="card-title">Shoes!</h2>
            <p>If a dog chews shoes whose shoes does he choose?</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">/buy</button>
            </div>
          </div>
        </div>
      )}

      

    </div>
  ])
}

function CommandHelp({label}: {label: string}) {
  return <span className="btn btn-primary min-h-fit h-auto p-2">{label}</span>
}

function Help({}) {
  return ([


    <div key={1}  className="chat chat-end mr-3">
      <div className="bg-primary  chat-bubble">/help</div>
    </div>,


    <div key={2} className="flex flex-row flex-wrap gap-5 ml-5 px-10 mt-5">
      <div className="card card-side bg-base-100 shadow-xl">
        <figure><img src="https://daisyui.com/images/stock/photo-1635805737707-575885ab0820.jpg" alt="Movie"/></figure>
        <div className="card-body">
          <p className="card-title font-bold">shopping stuff</p>
          

          <ul className="list-none list-outside space-y-3">
            <li><CommandHelp label="/all" />  show all the products we have to offer</li>
            <li><CommandHelp label="/sale" />   whats on sale</li>
            <li><CommandHelp label="/me" />   our personally shopper AI will look after you!</li>
            <li><p className="font-bold">account stuff</p></li>
            <li><CommandHelp label="/orders" />   show my orders</li>
            <li><CommandHelp label="/cart" />   your cart</li>
          </ul>
          
        </div>
      </div>
    </div>

  ])
}

type ChatMe = Array<{
  type: string,
  text?: string,
  component?: any
}>;

 export default function Chat() {
  const chatContainer = useRef(null);


  const [chatme, setChatme] = useState<ChatMe>([{type: "llm", text: "You underestimate my power!"}, {type: "me", text: "It's over Anakin, I have the high ground."}])

  const handleKeyDown = (event: any) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        setChatme((prev) => [...prev, {type: "me", text: event.target.value}]);
        
      }
  };

  useEffect(() => {
    if (chatContainer.current) {
      chatContainer.current.scrollTop = chatContainer.current.scrollHeight;

    }
  }, [chatme]);


  function help() {
    setChatme((prev) => [...prev, {type: "nav", component: Help}]);
  }

  return (


        <div id="cib-serp-main" className="absolute h-full w-full flex z-0">

          <div id="cib-conversation-main" className="flex relative h-full w-full overflow-y-scroll flex-col flex-1 z-0"  ref={chatContainer}>

              {/* padding top and botton to make space for the action bar and input */}
              <div className="content pt-28 pb-24 -z-1">

                  <ShopLanding/>

                { chatme.map((i,idx) => {
                  return i.type === "nav" ? (
                  
                       createElement(i.component, {})
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
              
                <div tabIndex={0} role="button" className="btn m-0 btn btn-primary join-item" onClick={help}>/help</div>
                  

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