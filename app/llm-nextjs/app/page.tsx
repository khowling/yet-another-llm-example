// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#unsupported-pattern-importing-server-components-into-client-components
// You cannot import a Server Component into a Client Component.
// import { getFileSaS } from "../utils/getSaS";


//import Chat from "./chat"
import ChatClient from "./chatClient"
import Header from "./header"
import FileUploadClient from "./FileUpload"
import FileList from "./FileList"
import { OpenAIResponse } from "./serverData";
import { useEffect, useRef } from "react";
import FeedLayout from "./feedLayout";



// Pages in Next.js are Server Components by default
export default function Page() {

    const asks = ["hello",  "how are you?", "what is your name?"]
    return ([
      <FeedLayout>
        <OpenAIResponse key={`4`} asks={"hello"} />
      </FeedLayout>,
      <Header key="header"/>
    ])
}