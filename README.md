
Will be Yet another LLM example

deciding between next14 and vite.  I dont want to create apis, so will use RSC with next, or tRPC with vite.
Issue is, openAI uses a streaming response, so tRPC is out (doesnt support at this time), and when I look at the RSC restrictions in next, clients cannot call servers, servers cannot have state, I've no idea how to develop a chat based ui without using a next api, and looking at vercels example, that is what they have done :(

so best of a bad set of options, using next with a api

RG=kh-aca
az group create -l westeurope -n $RG
az  deployment group create -g $RG --template-file ./deploy.bicep



#  Roadblock - Private Link support for Workload profiles!!
https://github.com/microsoft/azure-container-apps/issues/867


Client component calling server component
https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns
