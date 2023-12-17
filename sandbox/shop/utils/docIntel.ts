
import { DefaultAzureCredential } from '@azure/identity'
import { AzureKeyCredential, DocumentAnalysisClient }  from "@azure/ai-form-recognizer"
import { createBlobSas } from './blobStore'

  // set `<your-key>` and `<your-endpoint>` variables with the values from the Azure portal.
  const key = process.env.DOC_INTEL_KEY
  const endpoint = process.env.DOC_INTEL_ENDPOINT

  // sample document

  export async function analyzeDoc(fileName : string) {
    //const formUrl = process.env.DOC_INTEL_ENDPOINT

    const client = new DocumentAnalysisClient(endpoint, new DefaultAzureCredential());
    //const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));

    //The prebuilt-document model extracts key-value pairs, tables, and selection marks from documents. 
    // You can use this model as an alternative to training a custom model without labels.
    const {sasToken, accountName, containerName} = await createBlobSas(fileName)

    const poller = await client.beginAnalyzeDocumentFromUrl("prebuilt-document", `https://${accountName}.blob.core.windows.net/${containerName}/${fileName}?${sasToken}`);

    const {keyValuePairs} = await poller.pollUntilDone();

    return keyValuePairs

}
