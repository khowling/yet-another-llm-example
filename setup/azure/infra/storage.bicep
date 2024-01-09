
@minLength(4)
@maxLength(18)
param uniqueName string


@description('Location for the cluster.')
param location string = resourceGroup().location

@description('Specifies the object ID of a user, service principal or security group in the Azure Active Directory tenant for the vault. The object ID must be unique for the list of access policies. Get it by using Get-AzADUser or Get-AzADServicePrincipal cmdlets.')
param objectId string

@description('Blob public access settting')
@allowed([
  'None'
  'Blob'
  'Container'
])
param publicAccess string = 'None'

@description('principle type')
@allowed([
  'User'
  'ServicePrincipal'
])
param principalType string 

@description('Array of Blob container names to create')
param blobContainers array

//-----------------Storage Account Construction-----------------
resource StorageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: 'aishop${uniqueName}'
  location: location
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
  properties: {
    allowBlobPublicAccess: true
  }


  resource BlobService 'blobServices' = {
    name: 'default'
    properties: {
      cors: {
        corsRules: []
      }
    }
  
    resource containers 'containers'  = [for container in blobContainers: {
      name: container.name
      properties: {
        publicAccess: publicAccess
      }
    }]

  }
}

// Storage CORS!!!!

// Allows for generation of a user delegation key which can be used to sign SAS tokens
//var Storage_Blob_Delegator = '/providers/Microsoft.Authorization/roleDefinitions/db58b8e5-c6ad-4a2a-8342-4190687cbf4a'

@description('This is the built-in Storage Blob Contributor role.')
resource blobStorageDataContributorRoleDefinition 'Microsoft.Authorization/roleDefinitions@2018-01-01-preview' existing = {
  scope: subscription()
  name: 'ba92f5b4-2d11-453d-a403-e96b0029c9fe'
}

resource roleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(StorageAccount.id, objectId, blobStorageDataContributorRoleDefinition.id)
  scope: StorageAccount
  properties: {
    roleDefinitionId: blobStorageDataContributorRoleDefinition.id
    principalId: objectId
    principalType: principalType
  }
}


//form recognizer role assignment
//var Cognitive_Services_User = '/providers/Microsoft.Authorization/roleDefinitions/a97b65f3-24c7-4388-baec-2e87135dc908'
output storageAccountName string = StorageAccount.name
