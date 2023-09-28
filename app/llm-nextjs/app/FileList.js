
import { listBlobs } from "../utils/blobStore";

export default async function FileList() {

    let blobs = []
    for await (const blob of listBlobs()) {
        blobs = [...blobs, blob]
    }

    return (
      
      <div className="overflow-x-auto">
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
          {blobs.map((blob, idx) => 
            <tr>
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
                      <div className="font-bold">{blob.name}</div>
                    
                    </div>
                  </div>
                </td>

                <td>
                  
                </td>

                <td>Purple</td>
              
            </tr>
          )}
          
        </tbody>

      </table>
    </div>
    )
  }