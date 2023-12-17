
import { OpenAIClient, AzureKeyCredential }  from "@azure/openai";
const { DefaultAzureCredential } = require("@azure/identity");

const endpoint = process.env.OPENAI_ENDPOINT as string

// completions provides its functionality in the form of a text prompt, which by using a specific model, will then attempt to match the context and patterns, providing an output text.

export async function completion(fileName : string): Promise<{tables:string, paragraphs: string, keyValuePairs: string}> {

    // https://learn.microsoft.com/en-us/javascript/api/overview/azure/openai-readme?view=azure-node-preview
    const client = new OpenAIClient(endpoint, new DefaultAzureCredential());

    const messages = [
        { role: "system", content: "You are a helpful assistant. You will talk like a pirate." },
        { role: "user", content: "Can you help me?" },
        { role: "assistant", content: "Arrrr! Of course, me hearty! What can I do for ye?" },
        { role: "user", content: "What's the best way to train a parrot?" },
      ];
    
    console.log(`Messages: ${messages.map((m) => m.content).join("\n")}`);
    
    const events = client.listChatCompletions('gpt-35-turbo', messages, {
         maxTokens: 128,
         azureExtensionOptions: {
            extensions: [
              {
                type: "AzureCognitiveSearch",
                parameters: {
                  endpoint: "<Azure Cognitive Search endpoint>",
                  key: "<Azure Cognitive Search admin key>",
                  indexName: "<Azure Cognitive Search index name>",
                },
              },
            ],
        }
      
    );

    // Need to stream this response, trpc doesnt support response streaming :(
    https://github.com/trpc/trpc/issues/4477

    for await (const event of events) {
        for (const choice of event.choices) {
            const delta = choice.delta?.content;
            if (delta !== undefined) {
            console.log(`Chatbot: ${delta}`);
            }
        }
    }

}