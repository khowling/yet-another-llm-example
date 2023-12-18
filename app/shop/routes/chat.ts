import  { Router } from 'express'

import { DefaultAzureCredential, AzureCliCredential } from '@azure/identity'
import { OpenAIClient, AzureKeyCredential } from '@azure/openai'
import { close } from 'fs';

const client = new OpenAIClient('https://khaca-openai.openai.azure.com/', new AzureCliCredential());
const router = Router();

export default router;

const chats : Array<{question: string, chatid: string, complete: boolean}>= [] 

router.post('/request', (req, res) => {
    
    //const { id } = req.params;
    //const tweet = tweets.find(t => t.id === id);
    //tweet.likes += 1;
  
    const chat = {
        question: req.body.question,
        chatid:  Date.now()+''+Math.floor(Math.random()*999),
        complete: false
    }
    //console.log (chat)
    chats.push(chat)

    res.render ('llm', chat)
  });
  

const openCode = `
    <code class="text-sm sm:text-base inline-flex text-left items-center space-x-4 bg-gray-800 text-white rounded-lg p-4 pl-6">
        <span class="flex gap-4">`
const closeCode = `
        </span>
        <svg class="shrink-0 h-5 w-5 transition text-gray-500 group-hover:text-white" xmlns="http://www.w3.org/2000/svg"viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z"></path>
            <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z"></path>
        </svg>
    </code>`
  
/* GET home page. */
router.get('/completion', async (req, res, next) => {
    const { chatid } = req.query as { chatid: string };
        // Ask OpenAI for a streaming chat completion given the prompt
    
    
    const chatsidx = chats.findIndex(c => c.chatid === chatid)
    const chat = chats[chatsidx]
    console.log (chat)

    try {

        const headers = {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
        };
        res.writeHead(200, headers);
        res.write(`event: ${chat.chatid}\n`);

        const deploymentId = "gpt-35-turbo";
        const events = client.listChatCompletions(deploymentId, [
            { role: "system", content: "You are a helpful assistant. Respond as a tech influencer" },
            { role: "user", content: chat.question }
        ], { maxTokens: 256 });

        let response = '';
        let isopencode = false;

        for await (const event of events) {
            const content = event.choices?.[0]?.delta?.content ?? '';

            if (content) {
                // wait 1/2 a second
                //await new Promise((resolve) => setTimeout(resolve, 100));
                
                // need to add responses together to ensure we can match on completed patterns
                response += content;
                
                const codematch = response.match(/```(\w*)\n/)
                if (codematch && codematch.index) {

                    response = response.replace(/```(\w*)\n/, isopencode ? closeCode : openCode)
                    isopencode = !isopencode
                }
                response = response.replaceAll('\n', '<br/>')

                res.write(`event: ${chat.chatid}\n`);
                res.write(`data:  ${response}\n\n`);
                
            }
        }
        
        res.write(`event: close${chat.chatid}\n`);
        res.end(`data: <div class="chat-bubble chat-bubble-info">${response}</div>\n\n`);
        chats[chatsidx].complete = true
        //console.log (`completed: ${chatsidx}`)

    } catch (e: any) {
        console.error(e);
        res.status(500).end(e?.message);
    }
        
});
  


