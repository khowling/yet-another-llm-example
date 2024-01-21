#!/bin/sh
#set -x
location=${1:-"westeurope"}

uniqueName=${2:-$(printf '%05x' $RANDOM)}
rgName="aishop-${uniqueName}"

# Get signed in user objectId (PrincipalId)...
localDeveloperId=$(az ad signed-in-user show --query id -o tsv)

# Create resource group...
az group create -n $rgName -l $location >/dev/null

# Deploy infra...
DEPLOY_OUTPUT=$(az deployment group create -g $rgName  --template-file ./setup/azure/infra/main.bicep  --parameters uniqueName=${uniqueName} localDeveloperId=${localDeveloperId} --query [properties.outputs.cosmosConnectionURL.value,properties.outputs.storageAccountName.value,properties.outputs.openAIEndpoint.value,properties.outputs.openAIModel.value,properties.outputs.acrName.value] -o tsv)

# Set env vars...
export AISHOP_RG_NAME=$rgName
export AISHOP_MONGO_CONNECTION_STR=$(echo $DEPLOY_OUTPUT | cut -f 1 -d ' ')
export AISHOP_STORAGE_ACCOUNT=$(echo $DEPLOY_OUTPUT | cut -f 2 -d ' ')
export AISHOP_OPENAI_ENDPOINT=$(echo $DEPLOY_OUTPUT | cut -f 3 -d ' ')
export AISHOP_OPENAI_MODELNAME=$(echo $DEPLOY_OUTPUT | cut -f 4 -d ' ')
export AISHOP_ACR_NAME=$(echo $DEPLOY_OUTPUT | cut -f 5 -d ' ')
export AISHOP_IMAGE_CONTAINER=images


printenv | grep AISHOP_.*= | sed 's/AZ_\([^=]*=\)\(.*\)/\1\2/' 