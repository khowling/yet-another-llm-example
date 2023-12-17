import { inferAsyncReturnType, initTRPC } from '@trpc/server';
 import { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone';
import { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws';

// This is how you initialize a context for the server
export function createContext(
    opts: CreateHTTPContextOptions | CreateWSSContextFnOptions,
  ) {
    return {};
}

type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

export const publicProcedure = t.procedure;
export const router = t.router;

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
//const t = initTRPC.create();
 
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
//export const router = t.router;
//export const publicProcedure = t.procedure;