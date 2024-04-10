
import { type TenantDefinition } from '../init_config.js'

export default ({tenant, imageBaseUrl}: {tenant : TenantDefinition, imageBaseUrl : string}) =>  
    <div class="hero" style={`background-image: url(${imageBaseUrl}/${tenant.welcomeBackground?.pathname})`}>
        <div class="hero-overlay bg-opacity-60"></div>
        <div class="hero-content text-center text-neutral-content">
            <div class="max-w-md">
            <h1 class="mb-5 text-5xl font-bold">{tenant.welcomeMessage}</h1>
            <p class="mb-5">{tenant.description}</p>
            </div>
        </div>
    </div>
