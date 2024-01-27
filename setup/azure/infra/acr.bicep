
@minLength(4)
@maxLength(18)
param uniqueName string

@description('Location for the cluster.')
param location string = resourceGroup().location

@description('Provide a tier of your Azure Container Registry.')
param acrSku string = 'Basic'

@description('Specifies the object ID of a user, service principal or security group in the Azure Active Directory tenant for the vault. The object ID must be unique for the list of access policies. Get it by using Get-AzADUser or Get-AzADServicePrincipal cmdlets.')
param managedIdentityId string

@description('Id of the local developer to be added access to the storage account')
param localDeveloperId string

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

@description('This is the built-in ACR Pull image role.')
resource acrPull 'Microsoft.Authorization/roleDefinitions@2022-05-01-preview' existing = {
  scope: subscription()
  name: '7f951dda-4ed3-4680-a7ca-43fe172d538d'
}


@description('This is the built-in ACR Push image role.')
resource acrPush 'Microsoft.Authorization/roleDefinitions@2022-05-01-preview' existing = {
  scope: subscription()
  name: '8311e382-0749-4cb8-b61a-304f252e45ec'
}

@description('This is the general Contributor role, needed for build tasks')
resource contributor 'Microsoft.Authorization/roleDefinitions@2022-05-01-preview' existing = {
  scope: subscription()
  name: 'b24988ac-6180-42a0-ab88-20f7382dd24c'
}


// https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/role-based-access-control#azure-openai-roles
resource roleAssignmentPullMI 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(acrResource.id, managedIdentityId, acrPull.id)
  scope: acrResource
  properties: {
    roleDefinitionId: acrPull.id
    principalId: managedIdentityId
    principalType: 'ServicePrincipal'
  }
}

// https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/role-based-access-control#azure-openai-roles
resource roleAssignmentBuildMI 'Microsoft.Authorization/roleAssignments@2022-04-01' =  {
  name: guid(acrResource.id, managedIdentityId, contributor.id)
  scope: acrResource
  properties: {
    roleDefinitionId: contributor.id
    principalId: managedIdentityId
    principalType: 'ServicePrincipal'
  }
}

// https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/role-based-access-control#azure-openai-roles
resource roleAssignmentPushDev 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(localDeveloperId)) {
  name: guid(acrResource.id, localDeveloperId, acrPush.id)
  scope: acrResource
  properties: {
    roleDefinitionId: acrPush.id
    principalId: localDeveloperId
    principalType: 'User'
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

