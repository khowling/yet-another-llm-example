import {useState} from 'react'

import Chat from './components/chat'
import FileList from './components/FileList'
import FileUpload from './components/FileUpload'

import { trpc } from './trpc';

import { createWSClient, httpBatchLink, wsLink  } from '@trpc/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


const wsClient = createWSClient({
  url: `ws://localhost:3000/trpc`,
});


export default function App() {

  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        wsLink({
          client: wsClient,
        }),
        httpBatchLink({
          url: '/trpc',
          // You can pass any HTTP headers you wish here
          async headers() {
            return {
              authorization: 'none' //getAuthCookie(),
            };
          },
        }),
      ],
    }),
  );


  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <div className="container mx-auto px-4">

          <div className="text-center ">
            <h1 className="text-5xl font-bold">Login now!</h1>
            <p className="py-6">Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.</p>
          </div>

          <div className="flex flex-row gap-2 flex-wrap items-start">

            <div className="card md:basis-2/5 grow basis-full shadow-2xl bg-base-100">
                <Chat/>
            </div>

            <div className="card  md:basis-2/5 grow basis-full  shadow-2xl bg-base-100">
                <FileList/>
                <FileUpload/>
            </div>

          </div>

        </div>
      </QueryClientProvider>
    </trpc.Provider>
  )
}

