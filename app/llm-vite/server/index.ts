
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { publicProcedure, router, createContext } from './trpc.js';

 import { z } from 'zod';
import 'dotenv/config'

import WebSocket, { WebSocketServer } from 'ws';

import { Processor, ProcessorOptions} from "./lib/workflow/processor.js"
import { EventStoreConnection } from "./lib/eventing/eventStoreConnection.js"
import { StateManager, Reducer, ReducerReturn, Control, ChangeMessage, StateUpdate, StateStoreDefinition, ReducerInfo } from './lib/eventing/stateManager.js'
import { analyzeDoc } from './lib/docIntel.js'
import { createBlobSas } from './lib/blobStore.js'
import { observable } from '@trpc/server/observable';



// Our workflow

export interface IngestFile {
    _id?: number
    filename?: string;
    status?: IngestFileStatus;
    analyseDoc?: {tables:string, paragraphs: string, keyValuePairs: string};
}

export enum IngestFileStatus {
    Uploaded ,
    TextExtracted,
    EmbeddingsGenerated,
    Indexed
}


export interface IngestAction {
    type: ActionType;
    _id?: number; // for updates
    doc?: IngestFile;
}

export enum ActionType {
    New ,
    Update
}

type FileIngesterReducer = {
    fileIngester: {
        files: Array<IngestFile>
    }
}

export type FileIngesterState = Control & FileIngesterReducer


function fileIngesterReducer(): Reducer<FileIngesterState, IngestAction> {
    return {
        sliceKey: 'fileIngester',
        initState : {
            "files": { 
                type: 'LIST', 
            }
        },
        fn: async function (/*connection,*/ state, action): Promise<ReducerReturn> {
            const { type, _id, doc } = action
            switch (type) {
                case ActionType.New:
                    return [{ failed: !(doc && doc.filename)}, [
                        { method: 'ADD', path: 'files', doc}
                    ]]
                case ActionType.Update:
                    return [{ failed: false }, [
                        { method: 'UPDATE', path: 'files', filter: {_id } as {_id: number}, doc: { "$set" : doc} }
                    ]]
                default: 
                    return [null, null]
            }
        }
    }
}

class FileIngesterManager extends StateManager<FileIngesterState, IngestAction> {

    constructor(name: string, connection: EventStoreConnection) {
        super(name, connection, [
            fileIngesterReducer(),
        ], [])
    }
}


const esConnection = new EventStoreConnection('', 'fileingest')
const fileingestState = new FileIngesterManager('fileingest', esConnection)
const processor = new Processor('processor', esConnection, { linkedStateManager: fileingestState })

processor.use(async (ctx, next) => {
    return await next(
        // SimpleAction, to apply using the processor "statePlugin" StateManager in a !single transation! as the processor state
        { type: ActionType.New, doc: { filename: ctx.input, status: IngestFileStatus.Uploaded } as IngestFile  })
})

processor.use(async (ctx, next) => {

    const f : IngestFile = ctx.lastLinkedRes.fileIngester.files.added[0] as IngestFile
    // form recognisor

    // https://github.com/microsoft/sample-app-aoai-chatGPT/blob/main/scripts/data_utils.py#L360C16-L360C16
    const analyseDoc = await analyzeDoc(f.filename as string)

    return await next(
        // SimpleAction, to apply using the processor "statePlugin" StateManager in a !single transation! as the processor state
        { type: ActionType.Update, _id: f._id, doc: { analyseDoc } as IngestFile  },
        { update_ctx: { ingrestId: f._id } } as ProcessorOptions)
    )
})

processor.use(async (ctx, next) => {

    const f : IngestFile = await ctx.linkedStore.getValue('fileIngester', 'files', ctx.ingrestId)
    // form recognisor

    // https://github.com/microsoft/sample-app-aoai-chatGPT/blob/main/scripts/data_utils.py#L360C16-L360C16
    const analyseDoc = await analyzeDoc(f.filename as string)

    return await next(
        // SimpleAction, to apply using the processor "statePlugin" StateManager in a !single transation! as the processor state
        { type: ActionType.Update, _id: f._id, doc: { analyseDoc } as IngestFile  }, 
        
})

// ---------------------------------------------------------------- trpc

export type StateChangesUpdates<T> = {
    [key in  keyof T]: Array<StateUpdate> 
  }
  
  type WsMessageEvent = {
    type: 'EVENTS',
    sequence: number,
    statechanges: StateChangesUpdates<FileIngesterState>
  }
  
  
export type FactoryMetaData = {
    stateDefinition: {
        [sliceKey: string]: StateStoreDefinition;
    }
  }
  
  type WsMessageSnapshot = {
    type: 'SNAPSHOT',
    snapshot: FileIngesterState,
    metadata: FactoryMetaData
  }
  
  
export type WsMessage = WsMessageSnapshot | WsMessageEvent | {type: 'CLOSED'}

var submitFn : (update_ctx: any, input: any) => Promise<ReducerInfo> = async (update_ctx, input) => { throw new Error("submitFm not initialized") }


const appRouter = router({
    createBlobSas: publicProcedure
    .input(z.string())
    .query(async (opts) => {
        const { input } = opts;
        // Retrieve users from a datasource, this is an imaginary database
        console.log (`calling createBlobSas(${input})`)
        return await createBlobSas(input, true)
    }),
    processFile: publicProcedure
    .input(z.string())
    .mutation(async ({input}) => {
  
        // Retrieve users from a datasource, this is an imaginary database
        console.log (`calling createBlobSas(${input})`)
        return await submitFn(input, null)
    }),

    onAdd: publicProcedure
    .subscription(() => {
      // `resolve()` is triggered for each client when they start subscribing `onAdd`
      // return an `observable` with a callback which is triggered immediately
      return observable((emit) => {
        
        const onAdd = (data : WsMessage)  => {
          // emit data to client
          //const output = data.fullDocument 
          //console.log (data)
          emit.next(data);
        };

        (async () => {
          emit.next({
            type: 'SNAPSHOT',
            metadata: {
                stateDefinition: fileingestState.stateStore.stateDefinition            },
            snapshot: await fileingestState.stateStore.serializeState()
          } as WsMessage)
        })()

        /* Need to capture 'dispatch' changes to the factory state, initiated by the processor (via linked state) */
        processor.stateManager.on('changes', (message: ChangeMessage) => 
          message.stores[fileingestState.name] && onAdd({ type: 'EVENTS', sequence: message.sequence, statechanges: message.stores[fileingestState.name].changes as StateChangesUpdates<FileIngesterState> }  )
        )
        

        /*  Need to capture 'dispatch' changes to the factory state, initiated by the factory state directly (via factoryState.dispatch({ type: 'FACTORY_PROCESS' }))  */
        fileingestState.on('changes', (message: ChangeMessage) => 
          onAdd({ type: 'EVENTS', sequence: message.sequence, statechanges: message.stores[fileingestState.name].changes as StateChangesUpdates<FileIngesterState> }  )
        )
        
  /*
        // trigger `onAdd()` when `add` is triggered in our event emitter
        const em = changeStream.on('change', onAdd);
        console.log(em.listenerCount('change'))
*/
        // unsubscribe function when client disconnects or stops subscribing
        return () => {
          const smem = processor.stateManager.off('change', onAdd);
          const fsem = fileingestState.off('change', onAdd);
          console.log(`processor.stateManager listener Count: ${smem.listenerCount('change')}, fileingestState listener Count: ${fsem.listenerCount('change')}`)
        };
      });
    })
    
});
 
// Export type router type signature,
// NOT the router itself, imported into the client!
export type AppRouter = typeof appRouter;


// ---------------------------------------------------------------- trpc standalown server
// https://github.com/trpc/trpc/blob/main/examples/standalone-server/src/server.ts

const port = process.env.PORT || "3000"

async function init() {

    await fileingestState.stateStore.initStore({distoryExisting: true})
    await processor.stateStore.initStore({distoryExisting: true})
    submitFn = await processor.listen({ rollforwadStores: true, restartInterval: 1000})
    // http server
    const { server, listen } = createHTTPServer({
        router: appRouter,
        createContext,
    });

    // ws server
    const wss = new WebSocketServer({ server });
    const handler = applyWSSHandler<AppRouter>({
        wss,
        router: appRouter,
        createContext,
    });


    wss.on('connection', (ws) => {
        console.log(`➕➕ Connection (${wss.clients.size})`);
        ws.once('close', () => {
            console.log(`➖➖ Connection (${wss.clients.size})`);
        })
    })


    console.log(`✅ WebSocket Server listening on ws://localhost:${port}`);

    process.on('SIGTERM', () => {
        console.log('SIGTERM');
        handler.broadcastReconnectNotification();
        wss.close();
    })

    listen(parseInt(port));
}

init()