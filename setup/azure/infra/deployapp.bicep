@description('Location for the cluster.')
param location string = resourceGroup().location

@description('The resource id of the managed identity to be used for the container app.')
//param managedIdentityId string
param managedIdentityName string

@description('ACR Name for ACA')
param acrName string

@description('Key Vault Secret Uris')
param kvSecretUris array

@description('Aca Environment Id')
param AcaEnvironmentId string

@description('Storage Account Name')
param storageAccountName string

@description('Open AI Endpoint')
param openAIEndpoint string

@description('Git Repository Url')
param gitRepositoryUrl string

param blobImageContainerName string = 'images'

param imageName string = 'aishop/shop'
param imageTag string = string(dateTimeToEpoch(utcNow()))

module buildImage 'br/public:deployment-scripts/build-acr:2.0.2' =  {
  name: 'buildAcrImage-linux-dapr'
  params: {
    AcrName: acrName
    location: location
    gitRepositoryUrl:  gitRepositoryUrl
    buildWorkingDirectory:  'app/shop'
    imageName: imageName
    imageTag: imageTag
  }
}


// resource buildImage 'Microsoft.Resources/deploymentScripts@2020-10-01' = if (deployApp)  {
//   name: 'build-image'
//   location: location
//   kind: 'AzureCLI'
//   // will use the identity of the local developer to build the image
//   identity: {
//     type: 'UserAssigned'
//     userAssignedIdentities: {
//       '${managedIdentity.id}': {}
//     }
//   }
//   properties: {
//     azCliVersion: '2.54.0'
//     retentionInterval: 'P1D'
//     scriptContent: '''
//       #!/bin/bash
//       az acr build -r $AISHOP_ACR_NAME -t $IMAGE_NAME:$IMAGE_TAG  app/shop
//     '''

//     environmentVariables: [
//       {
//         name: 'AISHOP_ACR_NAME'
//         value: acr.outputs.acrName
//       }
//       {
//         name: 'IMAGE_TAG'
//         value: imageTag
//       }
//       {
//         name: 'IMAGE_NAME'
//         value: imageName
//       }
//     ]

//     supportingScriptUris: [
//       'app/shop'
//     ] 
//   }
// }

resource existingManagedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2018-11-30' existing = {
  name: managedIdentityName
}

param modelName string

resource containerapp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'aishop'
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${existingManagedIdentity.id}': {}
    }
  }
  properties: {
    environmentId: AcaEnvironmentId
    configuration: {
      registries: [
        {
            server: '${acrName}.azurecr.io'
            identity: existingManagedIdentity.id
        }
      ]
      secrets: map(kvSecretUris, (kvSecretUri) => {
          identity: existingManagedIdentity.id
          keyVaultUrl: kvSecretUri.secretUri
          name: kvSecretUri.name
      })
      ingress: {

        // can accept traffic from VNET
        external: true
        allowInsecure: true
        transport: 'http'
        targetPort: 3000
      }
    }
    template: {
      containers: [
        {
          image: '${imageName}:${imageTag}'
          name: 'ui'
          resources: {
            cpu: 1
            memory: '2Gi'
          }
          env: concat([
            {
              name: 'AISHOP_STORAGE_ACCOUNT'
              value: storageAccountName
            }
            {
              name: 'AISHOP_OPENAI_ENDPOINT'
              value: openAIEndpoint
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
              value: existingManagedIdentity.properties.clientId
            }
          ], map(kvSecretUris, (kvSecretUri) => {
              name: kvSecretUri.env
              secretRef: kvSecretUri.name
          }))
        }
      ]
      scale: {
        maxReplicas: 2
        minReplicas: 1
      }
    }
    workloadProfileName: 'Consumption'
  }
}


output acaName string = containerapp.name
