
@minLength(4)
@maxLength(18)
param uniqueName string


@description('Object ID of the user to be given role assignments, if none is provided, a managed identity will be created.')
param objectId string = ''

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
resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2018-11-30' = if(empty(objectId)) {
  name: 'aishop-${uniqueName}'
  location: location
}

var principalId = empty(objectId)? managedIdentity.properties.principalId: objectId
var principalType = empty(objectId)? 'ServicePrincipal' : 'User'

module keyvault './keyvault.bicep' = if (empty(objectId)) {
  name: 'deploy-keyvault'
  params: {
    uniqueName: uniqueName
    location: location
    secrets: [{
      name: 'cosmosConnectionURL'
      value: cosmosMongo42.outputs.cosmosConnectionURL
    }]
    objectId: principalId
    principalType: principalType
  }
}

module acr './acr.bicep' = {
  name: 'deploy-acr'
  params: {
    uniqueName: uniqueName
    location: location
    objectId: principalId
    principalType: principalType
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


module storage 'storage.bicep' = {
  name: 'deploy-storage'
  params: {
    uniqueName: uniqueName
    location: location
    objectId: principalId
    principalType: principalType
  }
}

module openai 'ai.bicep' = {
  name: 'deploy-ai'
  params: {
    uniqueName: uniqueName
    location: location
    objectId: principalId
    principalType: principalType
  }
}

module containerapps 'containerapps.bicep' = {
  name: 'deploy-containerapps'
  params: {
    uniqueName: uniqueName
    location: location
    objectId: principalId
    principalType: principalType
  }
}

output cosmosConnectionURL string = cosmosMongo42.outputs.cosmosConnectionURL
output storageAccountName string = storage.outputs.storageAccountName
output openAIEndpoint string = openai.outputs.openAIEndpoint
output openAIModel string = openai.outputs.openAIModel
output acrName string = acr.outputs.acrName
