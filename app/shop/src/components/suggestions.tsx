
export default ({welcomeMessage}: {welcomeMessage :  string}) =>  
    <div>
        <h1 class="text-lg text-slate-900">{welcomeMessage}</h1>
        <p class="text-slate-900">We are your AI assistant to help you find the best outfits for any occasions.  Tell me what you are looking for below, on start with one of these examples:</p>
        <div class="flex flex-row flex-wrap gap-5 my-5">
        
            <div class="card bg-base-100 shadow-xl basis-70 cursor-pointer"  hx-post="/api/chat/request" hx-target="#messages" hx-swap="beforebegin show:bottom" hx-vals={JSON.stringify({"question": "display all your occasions & describe then to me"})}>
                <div class="card-body">
                    <h3 class="card-title text-[#0006CF]">Stepping Out in Style</h3>
                    <p class="text-sm text-slate-900">Your Guide to Dazzling Dress Codes for Every Major Milestone!</p>
                </div>
            </div>

            <div  class="card bg-base-100 shadow-xl basis-70">
                <div class="card-body">
                    <h3 class="card-title text-[#0006CF]">Double the Glamour</h3>
                    <p class="text-sm text-slate-900">Twinning in Style for Twice the Impact!</p>
                </div>
            </div>

        </div>

    </div>