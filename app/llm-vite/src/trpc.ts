

// @filename: client.ts
import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
import { type AppRouter } from '../server/index';

const trpc = createTRPCReact<AppRouter>();

export {
    AppRouter,
    trpc
}
// https://trpc.io/docs/react#2-create-trpc-hooks
// a set of strongly-typed React hooks from "AppRouter" type signature





