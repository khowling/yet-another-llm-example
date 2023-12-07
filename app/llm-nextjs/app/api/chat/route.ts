


//import { OpenAIStream, StreamingTextResponse } from 'ai';

import { DefaultAzureCredential, AzureCliCredential } from '@azure/identity'
import { OpenAIClient, AzureKeyCredential } from '@azure/openai'


const client = new OpenAIClient('https://khaca-openai.openai.azure.com/', new AzureCliCredential());


// // Create an OpenAI API client (that's edge friendly!)
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY || '',
// });

function streamChatCompletions(client, deploymentId, messages, options) {
    const events = client.listChatCompletions(deploymentId, messages, options);
    const stream = new ReadableStream({
      async start(controller) {
        for await (const event of events) {
          if (event?.choices?.length > 0 && event.choices[0].delta.content)
          //  console.log(event.choices[0].delta.content);
          //const text = new TextDecoder().decode(value);
          // sleep for 1 second
          //await new Promise((resolve) => setTimeout(resolve, 1000));
          controller.enqueue(event.choices[0].delta.content);
        }
        controller.close();
      },
    });
  
    return stream;
  }

export async function POST(req: Request) {

  // Extract the `prompt` from the body of the request
  const body = await req.json();

  // Ask OpenAI for a streaming chat completion given the prompt
  const deploymentId = "gpt-35-turbo";

  console.log (body)
  try {
    const stream = streamChatCompletions(client, deploymentId, body, { maxTokens: 256 });

    const res = new Response(stream)
    res.headers.set('Content-Type', 'text/plain; charset=utf-8');
    res.headers.set('Transfer-Encoding', 'chunked');
    return res;

  } catch (e) {
    console.error(e);
    return new Response(e);
  }


}

