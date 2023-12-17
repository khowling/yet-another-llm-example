
import { BlockBlobClient } from "@azure/storage-blob";
import React, { useState} from "react";
import { trpc } from '../trpc';

// Supported Pattern: Passing Server Components to Client Components as Props
export default function FileUpload() {
    const { client } = trpc.useContext();
    const [status, setStatus] = useState<{busy:boolean, filename:string|null}>({busy: false, filename: null} ) 

    // Client or another process uses SAS token to upload content to blob
    async function uploadStringToBlob(blobName: string, {sasToken, accountName, containerName} : {sasToken:string, accountName:string, containerName:string}, file: File){

        // Create Url SAS token as query string with typical `?` delimiter
        const sasUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
        console.log(`\nBlobUrl = ${sasUrl}\n`);

        // Create blob client from SAS token url
        const blockBlobClient = new BlockBlobClient(sasUrl);

        // set mimetype as determined from browser with file upload control
        const options = { blobHTTPHeaders: { blobContentType: file.type } };

        // upload file
        await blockBlobClient.uploadData(file, options);
        
    }

    const mutation  = trpc.processFile.useMutation({
        async onSuccess() {
          // refetches posts after a post is added
          setStatus({busy: false, filename: null})
        },
      });

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {

        var file = e.currentTarget.files![0];
        if (!file) return;
        

        setStatus({busy: true, filename: file.name})
        console.log (file.name)
        const containerCreds = await client.createBlobSas.query(file.name)
        console.log (JSON.stringify(containerCreds))
        await uploadStringToBlob(file.name as string, containerCreds as any , file)
        mutation.mutate(file.name)
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