// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#unsupported-pattern-importing-server-components-into-client-components
// You cannot import a Server Component into a Client Component.
// import { getFileSaS } from "../utils/getSaS";

import Header from "./header"
import FeedLayout from "./feedLayout";



// Pages in Next.js are Server Components by default
export default function Page() {

    const asks = ["hello",  "how are you?", "what is your name?"]
    return ([
      <FeedLayout/>,
      <Header key="header"/>
    ])
}