
@minLength(4)
@maxLength(18)
param uniqueName string


@description('Object ID of a developer user to be given role assignments, to allow the app to be ran locally with dependencies in Azure')
param localDeveloperId string = ''

@description('Location for the cluster.')
param location string = resourceGroup().location

@description('Deploy the application if true, otherwise just deploy dependencies to be used by the application')
param deployApp bool = false

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
    managedIdentityId: managedIdentity.properties.principalId
    localDeveloperId: localDeveloperId
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
    managedIdentityId: managedIdentity.properties.principalId
    localDeveloperId: localDeveloperId
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
    modelVersion: location == 'westeurope' ? westEUModelVersion : westUSModelVersion
    managedIdentityId: managedIdentity.properties.principalId
    localDeveloperId: localDeveloperId
  }
}


// module buildImage 'br/public:deployment-scripts/build-acr:2.0.2' = if (deployApp) {
//   name: 'buildAcrImage-linux-dapr'
//   params: {
//     AcrName: acr.outputs.acrName
//     location: location
//     gitRepositoryUrl:  'https://github.com/khowling/ai-shop.git'
//     buildWorkingDirectory:  'app/shop'
//     imageName: 'aishop/ui'
//   }
// }

param imageName string = 'aishop/shop'
param imageTag string = string(dateTimeToEpoch(utcNow()))
resource buildImage 'Microsoft.Resources/deploymentScripts@2020-10-01' = if (deployApp)  {
  name: 'build-image'
  location: location
  kind: 'AzureCLI'
  // will use the identity of the local developer to build the image
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${managedIdentity.id}': {}
    }
  }
  properties: {
    azCliVersion: '2.54.0'
    retentionInterval: 'P1D'
    scriptContent: '''
      #!/bin/bash
      az acr build -r $AISHOP_ACR_NAME -t $IMAGE_NAME:$IMAGE_TAG  app/shop
    '''

    environmentVariables: [
      {
        name: 'AISHOP_ACR_NAME'
        value: acr.outputs.acrName
      }
      {
        name: 'IMAGE_TAG'
        value: imageTag
      }
      {
        name: 'IMAGE_NAME'
        value: imageName
      }
    ]

    supportingScriptUris: [
      'app/shop'
    ] 
  }
}

module containerapps 'containerapps.bicep' = if (deployApp) {
  name: 'deploy-containerapps'
  params: {
    uniqueName: uniqueName
    location: location
    managedIdentityId: managedIdentity.id
    acrName: acr.outputs.acrName
    acrImage: '${imageName}:${imageTag}' //buildImage.outputs.acrImage
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
        // See https://github.com/microsoft/azure-container-apps/issues/325#issuecomment-1265380377
        name: 'AZURE_CLIENT_ID'
        value: managedIdentity.properties.clientId
      }
    ]
  }
  dependsOn: [
    buildImage
  ]
}

output cosmosConnectionURL string = cosmosMongo42.outputs.cosmosConnectionURL
output storageAccountName string = storage.outputs.storageAccountName
output openAIEndpoint string = openai.outputs.openAIEndpoint
output openAIModel string = openai.outputs.openAIModel
output acrName string = acr.outputs.acrName
output acaName string = deployApp ? containerapps.outputs.acaName : ''
