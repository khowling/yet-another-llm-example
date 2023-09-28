import React, { Reducer, useState} from 'react'
import { trpc } from '../trpc';
import { FileIngesterReducerState, WsMessage, stateReducer } from '../utils/stateStore'
import { getValue } from '../../server/lib/eventing/jsStateStoreFunctions';


interface ConnectedInfo {
  status: ConnectedStatus,
  message?: string
}

enum ConnectedStatus {
  Connected,
  Trying,
  Error
}

export default function FileList() {

  const [state, dispatch] = React.useReducer<Reducer<FileIngesterReducerState, WsMessage>>(stateReducer, { state: null, metadata: null} )
  const [connected, setConnected] = useState({status: ConnectedStatus.Trying} as ConnectedInfo)


  // this returns a useEffect
  trpc.onAdd.useSubscription(undefined, {
    onStarted() {
      setConnected({status: ConnectedStatus.Connected})
    },
    onData<WsMessage>(data:any) {
      console.log ('got message')
      dispatch(data)
    },
    onError(err) {
      setConnected({status: ConnectedStatus.Error, message: err.message})
      console.error('Subscription error:', err);
      // we might have missed a message - invalidate cache
    }
  });


    let blobs : Array<{name:string}> = []
    //for await (const blob of listBlobs()) {
    //    blobs = [...blobs, blob]
    //}

    return (
      
      <div className="overflow-x-auto">
        { connected.status === ConnectedStatus.Trying ? 
        <div className="alert alert-warning shadow-lg">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span>Trying to connect to Log.....</span>
          </div>
        </div>
        : connected.status === ConnectedStatus.Error ? 
            <div className="alert alert-error shadow-lg">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Error! Cannot connect: {connected.message}</span>
            </div>
          </div>
        :
        <div className="alert alert-success shadow-lg">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Connected to live data stream</span>
          </div>
        </div>
      }

      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th>
              <label>
                <input type="checkbox" className="checkbox" />
              </label>
            </th>
            <th>Name</th>
            <th>Job</th>
            <th>Favorite Color</th>
          </tr>
        </thead>
        <tbody>
        { state.state && getValue(state.state, state.metadata.stateDefinition, 'fileIngester', 'files').map((o: any, idx: number) =>

            <tr key={idx}>
                <th>
                  <label>
                    <input type="checkbox" className="checkbox" />
                  </label>
                </th>

                <td>
                  <div className="flex items-center space-x-3">
                    <div className="avatar">
                      <div className="mask mask-squircle w-12 h-12">
                        <img src="/tailwind-css-component-profile-2@56w.png" alt="Avatar Tailwind CSS Component" />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">{o._id}</div>
                    </div>
                  </div>
                </td>

                <td>
                  
                </td>

                <td>{o.filename}</td>
              
            </tr>
          )}
          
        </tbody>

      </table>
    </div>
    )
  }