
Will be Yet another LLM example


RG=kh-aca
az group create -l westeurope -n $RG
az  deployment group create -g $RG --template-file ./deploy.bicep



#  Roadblock - Private Link support for Workload profiles!!
https://github.com/microsoft/azure-container-apps/issues/867