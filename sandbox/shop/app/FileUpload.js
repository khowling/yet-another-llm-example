"use client"

// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#unsupported-pattern-importing-server-components-into-client-components
// You cannot import a Server Component into a Client Component.
// import { getFileSaS } from "../utils/getSaS";
import Chat from "./chat"
import { BlockBlobClient } from "@azure/storage-blob";
import { useRouter } from 'next/navigation'
import { useState} from "react";


// Supported Pattern: Passing Server Components to Client Components as Props
export default function FileUploadClient() {

    const router = useRouter()
    const [status, setStatus] = useState({busy: false, filename: null})

    // Client or another process uses SAS token to upload content to blob
    async function uploadStringToBlob(blobName, {sasToken, accountName, containerName} , file){

        // Create Url SAS token as query string with typical `?` delimiter
        const sasUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
        console.log(`\nBlobUrl = ${sasUrl}\n`);

        // Create blob client from SAS token url
        const blockBlobClient = new BlockBlobClient(sasUrl);

        // set mimetype as determined from browser with file upload control
        const options = { blobHTTPHeaders: { blobContentType: file.type } };

        // upload file
        await blockBlobClient.uploadData(file, options);
        
        router.refresh()
    }

    const handleFileInput = async (e) => {

        var file = e.currentTarget.files[0];
        if (!file) return;
        

        setStatus({busy: true, filename: file.name})


        const res = await fetch(`/api?f=${status.filename}`, {
        headers: {
            'Content-Type': 'application/json',
        
        }})
        const containerCreds = await res.json()
        console.log (containerCreds)
        await uploadStringToBlob(filename, containerCreds , file)

        setStatus({bust: false, filename: null})
    }


    return (
        <div className="flex-end items-center relative">
            <input type="file" className="file-input file-input-bordered w-full z-0"  disabled={status.busy}  onChange={handleFileInput}/>
            { status.busy && 
                <div className="z-10 absolute bottom-0 left-0 ml-14 flex gap-14 items-center">
                    <span className="self-end loading loading-dots loading-md my-3" />
                    { /* <div className="my-3" >loading...</div> */ }
                </div>
            }
        </div>
        
        )
  }