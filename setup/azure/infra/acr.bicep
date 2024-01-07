
@minLength(4)
@maxLength(18)
param uniqueName string

@description('Location for the cluster.')
param location string = resourceGroup().location

@description('Provide a tier of your Azure Container Registry.')
param acrSku string = 'Basic'

@description('Specifies the object ID of a user, service principal or security group in the Azure Active Directory tenant for the vault. The object ID must be unique for the list of access policies. Get it by using Get-AzADUser or Get-AzADServicePrincipal cmdlets.')
param objectId string

@description('principle type')
@allowed([
  'User'
  'ServicePrincipal'
])
param principalType string 


resource acrResource 'Microsoft.ContainerRegistry/registries@2023-11-01-preview' = {
  name: 'aishop${uniqueName}'
  location: location
  sku: {
    name: acrSku
  }
  properties: {
    adminUserEnabled: false
  }
}



@description('This is the built-in Storage Blob Contributor role.')
resource acrPush 'Microsoft.Authorization/roleDefinitions@2022-05-01-preview' existing = {
  scope: subscription()
  name: '8311e382-0749-4cb8-b61a-304f252e45ec'
}


// https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/role-based-access-control#azure-openai-roles
resource roleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(acrResource.id, objectId, acrPush.id)
  scope: acrResource
  properties: {
    roleDefinitionId: acrPush.id
    principalId: objectId
    principalType: principalType
  }
}

/*
 **
 * buildTasks doest appear to work with the resource provider versions *
 ** 
resource buildContainer 'Microsoft.ContainerRegistry/registries/buildTasks@2018-02-01-preview' = {
  name: 'web-shop'
  location: location
  parent: acrResource
  properties: {
    alias: 'string'
    platform: {
      cpu: 1
      osType: 'Linux'
    }
    sourceRepository: {
      sourceControlType: 'Github'
      repositoryUrl: 'https://github.com/khowling/ai-shop'
    }
  }

  resource buildTask 'steps' = {
    name: 'build'
    properties: {
      type: 'Docker'
      contextPath: 'app/shop'
    }
  }
 
}
*/

@description('Output the login server property for later use')
output acrName string = acrResource.name
output loginServer string = acrResource.properties.loginServer
