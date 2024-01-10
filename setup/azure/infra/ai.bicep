
@minLength(4)
@maxLength(18)
param uniqueName string

@description('Location for the cluster.')
param location string = resourceGroup().location

@description('Specifies the object ID of a user, service principal or security group in the Azure Active Directory tenant for the vault. The object ID must be unique for the list of access policies. Get it by using Get-AzADUser or Get-AzADServicePrincipal cmdlets.')
param objectId string

@description('principle type')
@allowed([
  'User'
  'ServicePrincipal'
])
param principalType string 


@description('Specifies the name of the model to deploy')
param modelName string = 'gpt-35-turbo'

// https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#gpt-35-turbo-model-availability
@description('Specifies the version of the model to deploy, see https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#gpt-35-turbo-model-availability')
param modelVersion string = '1106'

var openAIName = 'aishop-${uniqueName}'
//---------OpenAI Construction---------
resource OpenAI 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: openAIName
  location: location
  kind: 'OpenAI'
  sku: {
    name: 'S0'
  }
  properties: {
    customSubDomainName: openAIName
    networkAcls: {
      defaultAction: 'Allow'
      virtualNetworkRules: []
      ipRules: []
    }
    publicNetworkAccess: 'Enabled'
  }

  resource gpt 'deployments' = {
    name: modelName
    properties: {
      model: {
        name: modelName
        format: 'OpenAI'
        version: modelVersion 
      }
    }
    sku: {
      name: 'Standard'
      capacity: 120
    }
  }

  resource textembeddingada002 'deployments' = {
    name: 'text-embedding-ada-002'
    properties: {
      model: {
        name: 'text-embedding-ada-002'
        format: 'OpenAI'
      }
    }
    sku: {
      name: 'Standard'
      capacity: 10
    }
    dependsOn: [
      gpt
    ]
  }
}


//---------FormRecognizer Construction---------
resource FormRecognizer 'Microsoft.CognitiveServices/accounts@2023-05-01' = if (false) {
  name: 'aishop-${uniqueName}'
  location: location
  kind: 'FormRecognizer'
  sku: {
    name: 'S0'
  }
  properties: {
    networkAcls: {
      defaultAction: 'Allow'
      virtualNetworkRules: []
      ipRules: []
    }
    publicNetworkAccess: 'Enabled'
  }
}

//---------Translator Construction---------
resource Translator 'Microsoft.CognitiveServices/accounts@2023-05-01' = if (false) {
  name: 'aishop-${uniqueName}'
  location: location
  kind: 'TextTranslation'
  sku: {
    name: 'S1'
  }
  properties: {
    networkAcls: {
      defaultAction: 'Allow'
      virtualNetworkRules: []
      ipRules: []
    }
    publicNetworkAccess: 'Enabled'
  }
}



@description('This is the built-in Storage Blob Contributor role.')
resource cognitiveServicesOpenAIUser 'Microsoft.Authorization/roleDefinitions@2018-01-01-preview' existing = {
  scope: subscription()
  name: '5e0bd9bd-7b93-4f28-af87-19fc36ad61bd'
}


// https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/role-based-access-control#azure-openai-roles
resource roleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(OpenAI.id, objectId, cognitiveServicesOpenAIUser.id)
  scope: OpenAI
  properties: {
    roleDefinitionId: cognitiveServicesOpenAIUser.id
    principalId: objectId
    principalType: principalType
  }
}

output openAIEndpoint string = OpenAI.properties.endpoint
output openAIModel string = modelName
