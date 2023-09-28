// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#unsupported-pattern-importing-server-components-into-client-components
// You cannot import a Server Component into a Client Component.
// import { getFileSaS } from "../utils/getSaS";


import Chat from "./chat"
import FileUploadClient from "./FileUpload"
import FileList from "./FileList"
import { Suspense } from "react"


  export default function Page() {
    return (
      <div className=" bg-base-200">
        <div className="container mx-auto">

          <div className="text-center ">
            <h1 className="text-5xl font-bold">Login now!</h1>
            <p className="py-6">Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.</p>
          </div>

          <div className="flex flex-row gap-2 flex-wrap items-start">

            <div className="card md:basis-2/5 grow basis-full shadow-2xl bg-base-100">
                <Chat/>
            </div>

            <div className="card  md:basis-2/5 grow basis-full  shadow-2xl bg-base-100">
                <Suspense fallback={<div>Loading...</div>}>
                  <FileList/>
                </Suspense>
                <FileUploadClient/>
            </div>

          </div>

        </div>
    </div>
    )
  }