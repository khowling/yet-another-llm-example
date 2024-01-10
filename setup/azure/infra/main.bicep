
@minLength(4)
@maxLength(18)
param uniqueName string


@description('Object ID of a developer user to be given role assignments, to allow the app to be ran locally with dependencies in Azure')
param userObjectId string = ''

@description('Location for the cluster.')
param location string = resourceGroup().location

// @description('Username for mongo admin user')
// param mongoAdminUser string = 'admin'

// @secure()
// @description('Password for mongo admin user')
// @minLength(8)
// @maxLength(128)
// param mongoAdminPassword string


// If we havnt passed in an identity to create permissions against, create one
resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2018-11-30' = {
  name: 'aishop-${uniqueName}'
  location: location
}

//var principalId = empty(objectId)? managedIdentity.properties.principalId: objectId
//var principalType = empty(objectId)? 'ServicePrincipal' : 'User'

module keyvault './keyvault.bicep' =  {
  name: 'deploy-keyvault'
  params: {
    uniqueName: uniqueName
    location: location
    secrets: [{
      env: 'AISHOP_MONGO_CONNECTION_STR'
      name: 'cosmos-connection'
      value: cosmosMongo42.outputs.cosmosConnectionURL
    }]
    objectId: managedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

module acr './acr.bicep' = {
  name: 'deploy-acr'
  params: {
    uniqueName: uniqueName
    location: location
    objectId: managedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// module mongov6 './mongov6.bicep' = {
//   name: 'deploy-mongov6'
//   params: {
//     uniqueName: uniqueName
//     location: location
//     adminUsername: mongoAdminUser
//     adminPassword: mongoAdminPassword
//   }
// }


module cosmosMongo42 './cosmos-mongo42.bicep' = {
  name: 'deploy-cosmos-mongo42'
  params: {
    uniqueName: uniqueName
    location: location
  }
}

var blobImageContainerName = 'images'

module storage 'storage.bicep' = {
  name: 'deploy-storage'
  params: {
    uniqueName: uniqueName
    location: location
    blobContainers: [
      {
        name: blobImageContainerName
      }
    ]
    objectId: managedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#gpt-35-turbo-model-availability
var modelName = 'gpt-35-turbo'
var westUSModelVersion = '1106'
var westEUModelVersion = '0301'

module openai 'ai.bicep' = {
  name: 'deploy-ai'
  params: {
    uniqueName: uniqueName
    location: location
    modelName: modelName
    modelVersion: westEUModelVersion
    objectId: managedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

module containerapps 'containerapps.bicep' = {
  name: 'deploy-containerapps'
  params: {
    uniqueName: uniqueName
    location: location
    managedIdentityId: managedIdentity.id
    acrName: acr.outputs.acrName
    acrImage: acr.outputs.acrImage
    kvSecretUris: keyvault.outputs.secretUris
    envConfig: [
      {
        name: 'AISHOP_STORAGE_ACCOUNT'
        value: storage.outputs.storageAccountName
      }
      {
        name: 'AISHOP_OPENAI_ENDPOINT'
        value: openai.outputs.openAIEndpoint
      }
      {
        name: 'AISHOP_OPENAI_MODELNAME'
        value: modelName
      }
      {
        name: 'AISHOP_IMAGE_CONTAINER'
        value: blobImageContainerName
      }
      {
        // Required for the @azure/identity DefaultAzureCredential
        name: 'AZURE_CLIENT_ID'
        value: managedIdentity.properties.clientId
      }
    ]
  }
}

output cosmosConnectionURL string = cosmosMongo42.outputs.cosmosConnectionURL
output storageAccountName string = storage.outputs.storageAccountName
output openAIEndpoint string = openai.outputs.openAIEndpoint
output openAIModel string = openai.outputs.openAIModel
output acrName string = acr.outputs.acrName
