import { HTMLPage } from "./page";


export default ({sseUrl, runEvent, completeEvent}: {sseUrl: string, runEvent : string, completeEvent : string}) => 
    <HTMLPage>
        <div id="sse-response" hx-ext="sse" sse-connect={sseUrl}  sse-swap={runEvent} hx-swap="innerHTML show:#messages:bottom" hx-target="find #stream">
            <div sse-swap={completeEvent} hx-swap="outerHTML show:#messages:bottom"  hx-target="closest #sse-response" ></div>
            <div style="width: fit-content;" id="stream"></div>
        </div>
    </HTMLPage>
