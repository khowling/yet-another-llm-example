// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#unsupported-pattern-importing-server-components-into-client-components
// You cannot import a Server Component into a Client Component.
// import { getFileSaS } from "../utils/getSaS";


import Chat from "./chat"
import Header from "./header"
import FileUploadClient from "./FileUpload"
import FileList from "./FileList"
import { Suspense } from "react"



export default function Page() {
    return ([
      <Chat key="chat"/>,
      <Header key="header"/>
    ])
}