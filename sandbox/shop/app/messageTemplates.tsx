
import { useContext, useEffect, useState } from "react";
import { type ChatMe, ChatMeType, FeedContext, ReducerActionType } from "./feedLayout";

function ShopBanner() {
  return (
    <div key={0} className="hero mx-0 sm:mx-14 max-w-3xl" style={{backgroundImage: 'url(https://daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.jpg)'}}>
      <div className="hero-overlay bg-opacity-60"></div>
      <div className="hero-content text-center text-neutral-content">
        <div className="max-w-md">
          <h1 className="mb-5 text-5xl font-bold">Hello there</h1>
          <p className="mb-5">Welcome to our excellent shop, come explore what we have to offer.</p>
          
        </div>
      </div>
    </div>
  )
}
export function ShopLanding() {

    //await new Promise(resolve => setTimeout(resolve, 1000));
    return ([
      <ShopBanner key="banner1"/>,

      <Explore key="explore1" componentProp="keith"/>,
  
      <div key="Help1" className="chat chat-start ml-5 mt-5">
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

    const [categories, setCategories] = useState<Array<any>>();
    
    useEffect(() => {
        fetch('/api/products', {
          headers: {
              'Content-Type': 'application/json'
          }}).then((response) => response.json())
          .then((data) => {
            setCategories(data);
            console.log(data);
          })
      }, [])
  

    return (
      
      <div className="flex flex-row flex-wrap gap-5 ml-5 px-10 mt-5">
  
        { categories ? categories.map((i,idx) => 
          
          <div key={i.title} className="card bg-base-100 shadow-xl basis-60">
            <figure><img src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg" alt="Shoes" /></figure>
            <div className="card-body">
            <h2 className="card-title">{i.heading}</h2>
                  <p>{i.description.substring(0, 80)}...</p>
              <div className="card-actions justify-end">
                
                <CommandHelp command="/explore" type={ChatMeType.nav} component={Explore} componentProp={i.heading} />
               
              </div>
            </div>
          </div>
        )  : 
          [1,2,3].map((i,idx) =>
            <div className="mb-16 flex flex-col gap-4 w-52">
              <div className="skeleton h-32 w-full"></div>
              <div className="skeleton h-8 w-28 mt-5"></div>
              { [1,2,3,4].map(i => <div key={i} className="skeleton h-4 w-full"></div>)}
              
            </div>
          )
      }
      </div>
    )
  }
  
export function CommandHelp({command, component, componentProp } : ChatMe) {
    const dispatch = useContext(FeedContext);

    const onclick = () => dispatch( { type: ReducerActionType.push, chat: {type: ChatMeType.nav, command, component, componentProp}})

    const cmdOut = <span className={`btn btn-primary min-h-fit h-auto p-${componentProp ? '1' : '2'}`} onClick={onclick}>{command}</span>
    return componentProp === undefined ? cmdOut : <span className="btn min-h-fit h-auto p-1 border-primary bg-base-100 pr-2" onClick={onclick}>{cmdOut}{componentProp}</span>
  }
  
  export function Help() {
  
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