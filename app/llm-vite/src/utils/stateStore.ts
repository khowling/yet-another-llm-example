

import type { FileIngesterState, WsMessage, FactoryMetaData } from '../../server/index';
export type { FileIngesterState, WsMessage, FactoryMetaData } from '../../server/index';
export type { Control, UpdatesMethod, StateUpdate, StateStoreDefinition } from '../../server/lib/eventing/stateManager';
import { getValue, applyGenerateChanges } from '../../server/lib/eventing/jsStateStoreFunctions';


export type FileIngesterReducerState = {
    state: FileIngesterState,
    metadata: FactoryMetaData
}  | { state: null, metadata: null}


var assertfn = console.assert

export function stateReducer({ state, metadata }: FileIngesterReducerState, action : WsMessage) : FileIngesterReducerState {


    switch (action.type) {
        case 'SNAPSHOT':
            return { state: action.snapshot, metadata: action.metadata }
        case 'EVENTS':
        
            if (state && metadata) {

                console.log ("current state (sequence)", state !== null ? getValue(state, metadata?.stateDefinition, '_control', 'log_sequence'): 'undefined')
                console.log("incoming action", action.sequence)

                const {newstate, returnInfo} =  applyGenerateChanges(assertfn, state, metadata.stateDefinition, action.sequence,  action.statechanges)
                return { 
                    state: { ...state, ...newstate }, 
                    metadata 
                }
                
            } else {
                throw new Error(`Got events before SNAPSHOT`);
            }

        case 'CLOSED':
            // socket closed, reset state
            return {state: null, metadata: null}


        default:
            throw new Error(`unknown action type`);
    }
}

