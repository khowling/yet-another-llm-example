import { html } from '@elysiajs/html'

import { type TenantDefinition } from '../init_config.js'
import Welcome from './welcome.js'
import Command from './command.js'




const Header = ({tenant}: {tenant : TenantDefinition}) => 
    <header class="z-1 relative bg-base-100 navbar pt-3">
                        
        <div class="flex-1">
            <a class="btn btn-ghost text-xl" hx-get="/reset">
                <svg width="175px" aria-label="Sainsburys logo" viewBox="0 0 204 40" xmlns="http://www.w3.org/2000/svg"><title>Sainsbury’s</title><g fill="#F06C00" fill-rule="evenodd"><path d="M186.917 1.03c4.257 0 1.66 8.636-.642 8.636h-1.025c-.354 0-.596-.194-.596-.436 0-.636.789-1.379.789-3.433 0-2.022-1.473-3.487-1.473-4.082 0-.293.098-.685.631-.685h2.316zm4.457 12.834c0 3.857 12.444 2.104 12.444 9.81 0 8.975-9.958 8.922-15.366 6.48-.586-.286-.725-.725-.725-1.265v-1.898c0-.683.287-.883.77-.883.345 0 .64.154.93.4 4.181 3.219 9.992 2.865 9.992-.488.001-4.205-12.285-2.596-12.285-10.35 0-6.87 8.487-8.291 14.821-5.654.596.232.744.726.744 1.266v1.603c0 .691-.296.884-.788.884-.249 0-.631-.193-.93-.39-3.507-2.391-9.607-2.686-9.607.485z"></path><path d="M202.052 10.052a.576.576 0 0 1-.085-.031c.015.007.05.017.085.031zm.16.066a.402.402 0 0 0-.085-.036l.084.036zM69.685 8.6c4.703 0 6.81 2.74 6.81 6.703V30.43a.57.57 0 0 1-.588.592h-4.704c-.238 0-.48-.245-.48-.592V15.797c0-1.665-.197-3.629-3.438-3.629-1.662 0-3.616.974-4.548 1.524V30.43a.57.57 0 0 1-.596.592h-4.694c-.245 0-.49-.245-.49-.592V9.677c0-.345.245-.596.49-.596H62c.35 0 .589.251.589.596l.102 1.122c1.463-.886 4.304-2.2 6.994-2.2zm89.784.358c.631.149.972.546.972 1.027v3.08c0 .329-.292.68-.643.68-.525 0-1.024-.203-1.649-.351-2.646-.533-6.631-.387-6.631 3.813v13.162a.57.57 0 0 1-.582.59h-4.692c-.244 0-.486-.245-.486-.59V9.693c0-.346.242-.586.486-.586h4.544c.333 0 .582.24.582.586l.099 2.628c.932-1.361 3.129-3.606 5.838-3.606.635 0 1.229 0 2.163.243z"></path><path d="M159.469 8.958l.227.056a7.702 7.702 0 0 0-.227-.056zm-18.491.15c.33 0 .582.24.582.587v13.652c0 6.047-4.871 8.1-9.753 8.1-4.834 0-9.71-2.053-9.71-7.513V9.694c-.001-.345.243-.585.489-.585h4.685c.336 0 .581.24.581.587v15.36c0 2.301 1.467 3.708 3.954 3.708 3.034 0 4-1.704 4-4.877V9.695c0-.347.25-.587.495-.587h4.676zM46.006 3.556c0-1.463 1.026-2.733 3.161-2.736h.02c2.042.003 3.066 1.273 3.066 2.736 0 1.757-1.174 2.927-3.076 2.927-1.908 0-3.17-1.17-3.17-2.927zm5.563 5.613a.56.56 0 0 1 .579.579v20.681c0 .347-.243.59-.579.59h-4.683c-.245 0-.49-.243-.49-.59V9.748c0-.335.245-.58.49-.58h4.683zm59.415-.325c5.026 0 8.194 4.392 8.194 10.237 0 7.52-5.22 12.492-11.663 12.492-3.518 0-6.093-1.226-7.796-2.535-.73-.535-.881-1.458-.881-2.24V1.62c0-.34.241-.58.484-.58h4.675c.342 0 .59.24.59.58v9.707c.925-.775 3.072-2.484 6.397-2.484zM107.9 28.94c3.122 0 5.331-3.214 5.331-8.686 0-2.043-.452-7.8-4.884-7.8-1.761 0-3.034.973-3.76 1.508v13.18c0 .437.09.867.684 1.262.484.286 1.218.536 2.63.536zM5.422 7.682c0 5.554 15.466 4.975 15.466 13.995 0 9.796-11.663 12.05-19.86 8.19-.484-.298-.58-.538-.58-.978v-2.48c0-.448.15-.883.977-.883.441 0 .724.251 1.363.688 6.783 4.728 12.628 1.898 12.628-2.155 0-6.674-15.213-4.63-15.213-14.487 0-4.53 3.512-8.532 10.003-8.532 3.216 0 6.136.63 7.803 1.261.44.203.532.449.532.878v2.836c0 .441-.147.782-.674.782-.442 0-.788-.247-1.323-.635C14.6 4.749 12.736 3.92 10.298 3.92c-2.726 0-4.876 1.507-4.876 3.76zm27.8.876c6.884 0 8.982 2.732 8.982 6.684v15.174a.563.563 0 0 1-.585.578h-4.44c-.243 0-.48-.239-.48-.578l-.11-1.27c-1.564 1.36-3.413 2.339-5.657 2.339-4.1 0-7.611-2.339-7.611-6.73 0-5.325 5.9-6.483 8.49-6.829 4.245-.54 4.638-.827 4.638-1.954 0-2.39-.439-4.346-3.421-4.346-2.388 0-4.19.835-6.004 2.052-.291.2-.727.737-1.311.737-.288 0-.823-.299-.823-.974v-2.194c0-.448.19-.886.728-1.178 1.954-.971 4.973-1.511 7.604-1.511zm3.227 17.663v-6.452c-5.42 0-7.467 2.445-7.467 5.083 0 1.856.974 3.698 3.556 3.698 2.251 0 3.91-1.698 3.91-2.329zm47.315-12.357c0 3.857 12.433 2.104 12.433 9.81 0 8.975-9.957 8.922-15.356 6.48-.599-.286-.742-.725-.742-1.265v-1.898c0-.683.301-.883.785-.883.337 0 .634.154.926.4 4.197 3.219 9.996 2.865 9.996-.488 0-4.205-12.283-2.596-12.283-10.35 0-6.87 8.477-8.291 14.825-5.654.582.232.727.726.727 1.266v1.603c0 .691-.288.884-.772.884-.246 0-.646-.193-.93-.39-3.518-2.391-9.61-2.686-9.61.485zm89.309 19.393c-1.22 3.156-4.729 5.798-8.491 5.798-.638 0-1.21 0-2.052-.253-.628-.144-.967-.526-.967-1.017v-2.779c0-.343.298-.68.635-.68.535 0 .924.145 1.51.295 3.852 1.076 7.268-.15 7.369-3.764l-8.879-20.535c-.198-.487-.25-.629-.25-.774 0-.292.147-.44.438-.44h5.332c.43 0 .626.148.774.538l4.966 13.17.295.922.292-.923 4.83-13.17c.1-.34.343-.537.69-.537h2.236c.242 0 .445.197.445.44 0 .191-.102.332-.203.63l-8.969 23.079z"></path></g></svg>
            </a>
        </div>
        
        <div class="flex-none gap-8 mr-5">

            <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
                <div class="indicator">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <span class="badge badge-sm indicator-item">2</span>
                </div>
            </div>
            <div tabindex="0" class="mt-3 z-[1] card card-compact dropdown-content w-52 bg-base-100 shadow">
                <div class="card-body">
                <span class="font-bold text-lg">Items</span>
                <span class="text-info">Subtotal: £</span>
                <div class="card-actions">
                    <Command command='/cart'/>
                
                </div>
                </div>
            </div>
            </div>

            <label class="swap swap-rotate">
            <input type="checkbox" class="theme-controller" value="dark" />
            <svg class="swap-on fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/></svg>
            <svg class="swap-off fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/></svg>
            </label>

            <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                <div class="w-10 rounded-full">
                <img alt="Tailwind CSS Navbar component" src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
                </div>
            </div>


            <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                <a class="justify-between">
                    Profile
                    <span class="badge">New</span>
                </a>
                </li>
                <li><a>Settings</a></li>
                <li><a>Logout</a></li>
            </ul>
            </div>
        </div>
    </header>


export const HTMLPage = ({children}: {children?: any}) =>
    <html data-theme="winter">
    <head>
        <title>UI Store</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="public/stylesheets/style.css" rel="stylesheet" type="text/css" />
        <link href="https://cdn.jsdelivr.net/npm/daisyui@4.4.20/dist/full.min.css" rel="stylesheet" type="text/css" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/htmx.org@1.9.9" integrity="sha384-QFjmbokDn2DjBjq+fM+8LUIVrAgqcNW2s0PjAxHETgRn9l4fvX31ZxDxvwQnyMOX" crossorigin="anonymous"></script>
        <script src="https://unpkg.com/htmx.org/dist/ext/sse.js"></script>
        <script src="js/tailwind.js"></script>
    </head>
    <body>
            {children}
    </body>
    </html>


export default ({tenant, imageBaseUrl}: {tenant : TenantDefinition, imageBaseUrl : string}) => 
    <HTMLPage>
        <div class="absolute h-full w-full flex z-0">
            <div id="chatContainer" class="flex  relative h-full w-full overflow-y-scroll flex-col flex-1 z-0"  >
                <div id="scroller" class="pt-28 -z-1 sm:px-16" hx-trigger="load" hx-get="/explore" hx-swap="beforebegin show:bottom" hx-target="#messages">
                <Welcome tenant={tenant} imageBaseUrl={imageBaseUrl}/>
                <div class="h-24" id="messages"></div>
                </div>
            </div>



            <div id="cib-action-bar" class="absolute bottom-0 flex w-full  bg-base-100 transition-opacity mr-10">
        
                <div class="sm:px-16 px-4 mb-6 mt-4 w-full">
        
                    <form class="w-full" autocomplete="off" {...{ 'hx-on::after-request': 'this.reset()' }} hx-post="/api/chat/request" hx-target="#messages" hx-swap="beforebegin show:bottom">   

                        <div class="relative  w-full">
                            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                                </svg>
                            </div>
                            <input  id="question" name="question" type="text" class="block w-full p-4 ps-10 leading-5 border-orange border  focus:outline-none  focus:border-primary focus:border-2 font-semibold" placeholder="For help, type /help" />
                            <button type="button" class="absolute end-5 bottom-2.5 btn bg-[#F06C00] text-white min-h-fit h-auto p-2" hx-trigger="click" hx-get="/help" hx-target="#messages" hx-swap="beforebegin show:bottom">/help</button>
                        

                            <div id="cmd-dropdown" class="invisible transition transition-opacity duration-300 absolute left-8 bottom-16 z-10 mt-2 w-4/5 p-2 origin-bottom-left rounded-md bg-base-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
                                <div class="py-1" role="none">
                                <div class="ml-4 my-2"><Command command='/help'/><b>to see what you can do</b></div>
                                <div class="ml-4 my-2"><Command command='/cart'/><b>to open your cart</b></div>
                                <div class="ml-4  my-2"><Command command='/recommend'/><b>whats good today?</b></div>
                                <div class="ml-4  my-2"><Command command='/allergies'/><b>let us help</b></div>
                                </div>
                            </div>

                        </div>
                    </form>

                </div>
            </div>
            
        </div>
        <Header tenant={tenant}/>
    </HTMLPage>
