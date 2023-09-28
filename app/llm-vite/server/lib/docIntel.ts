
import { DefaultAzureCredential } from '@azure/identity'
import { AzureKeyCredential, DocumentAnalysisClient }  from "@azure/ai-form-recognizer"
import { createBlobSas } from './blobStore.js'


const endpoint = process.env.DOC_INTEL_ENDPOINT as string

  // sample document
  export async function analyzeDoc(fileName : string) {
    //const formUrl = process.env.DOC_INTEL_ENDPOINT

    const client = new DocumentAnalysisClient(endpoint, new DefaultAzureCredential());
    //const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));

    //The prebuilt-document model extracts key-value pairs, tables, and selection marks from documents. 
    // You can use this model as an alternative to training a custom model without labels.
    const {sasToken, accountName, containerName} = await createBlobSas(fileName)
    const sasurl =  `https://${accountName}.blob.core.windows.net/${containerName}/${fileName}?${sasToken}`
    console.log(`beginAnalyzeDocumentFromUrl ${sasurl}`)
    const poller = await client.beginAnalyzeDocumentFromUrl("prebuilt-document", sasurl);

    const res = await poller.pollUntilDone();

    const strres = 
      res.tables?.map(t=> t.cells.reduce((a:any,c:any) => { return c.columnIndex === 0 ? [...a, [c.content]] : [...a.slice(0,-1), [...a[a.length-1],`${a[0][c.columnIndex] || ''} ${c.content}`]] }, []).slice(1).map(i => i.join(', ')).join('.  ')).join('\n  ') +
      '\n' +
      res.paragraphs?.map (i => i.content).join(', ') +
      '\n' +
      res.keyValuePairs?.map(i => `${i.key.content} ${i.value?.content}`).join(', ')


    return strres

}
