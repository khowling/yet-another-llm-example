
//-----------------Storage Account Construction-----------------
resource StorageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: '${resourcePrefix}sa'
  location: location
  kind: 'StorageV2'
  sku: {
    name: 'Standard_GRS'
  }


  resource BlobService 'blobServices' = {
    name: 'default'
    properties: {
      cors: {
        corsRules: []
      }
    }
  
    resource BlobContainer 'containers' = {
      name: 'uploads'
      properties: {
        publicAccess: 'None'
      }
    }
  }
}

// Storage CORS!!!!

// Allows for generation of a user delegation key which can be used to sign SAS tokens

//var Storage_Blob_Delegator = '/providers/Microsoft.Authorization/roleDefinitions/db58b8e5-c6ad-4a2a-8342-4190687cbf4a'
var Storage_Blob_Data_Contributor = '/providers/Microsoft.Authorization/roleDefinitions/ba92f5b4-2d11-453d-a403-e96b0029c9fe'
resource roleAssignment 'Microsoft.Authorization/roleAssignments@2020-04-01-preview' = {
  name: 'aca-role-assignment'
  scope: StorageAccount.id
  properties: {
    principalId: principalId
    roleDefinitionId: Storage_Blob_Data_Contributor
  }
}


//form recognizer role assignment
var Cognitive_Services_User = '/providers/Microsoft.Authorization/roleDefinitions/a97b65f3-24c7-4388-baec-2e87135dc908'
