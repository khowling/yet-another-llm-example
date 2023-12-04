import { Suspense } from "react";


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


export default function ServerData() {
    return (
        <Suspense fallback={<p>Loading feed...</p>}>
            <ShopLanding/>
        </Suspense>
    )
}


export async function* txtComing () {
    const txt = "Hello! I'm talking to you realtime!"

    for (let i = 0; i < txt.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        yield txt[i]
    }
}


export async function ShopLanding() {

    await new Promise(resolve => setTimeout(resolve, 1000));
    return ([
      <div key={0} className="hero sm:w-4/5 mx-14" style={{backgroundImage: 'url(https://daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.jpg)'}}>
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold">Hello there</h1>
            <p className="mb-5">Welcome to our excellent shop, come explore what we have to offer.</p>
            
          </div>
        </div>
      </div>,
  
      <div key={1} className="chat chat-start ml-5 mt-5">
        <div className="chat-image avatar">
          <div className="w-8 rounded-full">
            <img alt="Tailwind CSS chat bubble component" src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
          </div>
        </div>
  
        <div className="chat-bubble chat-bubble-info">
          <div className="">type <CommandHelp command="/explore" type={ChatMeType.nav} component={Explore} /> or <CommandHelp command="/sale" type={ChatMeType.nav} component={ShopLanding} />  at any time to start navigating our catalog, or press <CommandHelp command="/help" type={ChatMeType.nav} component={Help} />  
          </div>      
        </div>
      </div>
  
    ])
  }
  
  function Explore({componentProp}: {componentProp: string}) {
    return (
      
      <div key={6} className="flex flex-row flex-wrap gap-5 ml-5 px-10 mt-5">
  
        { [{title: "shoes"},{title: "bikes"},{title: "phones"}].map((i,idx) => 
          
          <div key={idx} className="card bg-base-100 shadow-xl basis-60">
            <figure><img src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg" alt="Shoes" /></figure>
            <div className="card-body">
              <h2 className="card-title">{i.title}</h2>
              <p>If a dog chews shoes whose shoes does he choose?</p>
              <div className="card-actions justify-end">
                
                <CommandHelp command="/explore" type={ChatMeType.nav} component={Explore} componentProp={i.title} />
               
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
  
  function CommandHelp({command, component, componentProp } : ChatMe) {
  
    
    //const pushChat = useContext(MyChatContext);
  
    const cmdOut = <span className={`btn btn-primary min-h-fit h-auto p-${componentProp ? '1' : '2'}`}  onClick={() => { console.log ('push') }}>{command}</span>
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
                <tr><td><CommandHelp command="/explore" type={ChatMeType.nav} component={Explore}/></td><td>navigate all products we have to offer</td></tr>
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
  