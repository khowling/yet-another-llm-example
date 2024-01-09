
@minLength(4)
@maxLength(18)
param uniqueName string

@description('Location for the cluster.')
param location string = resourceGroup().location

@description('Specifies the Azure Active Directory tenant ID that should be used for authenticating requests to the key vault. Get it by using Get-AzSubscription cmdlet.')
param tenantId string = subscription().tenantId

@description('Specifies the object ID of a user, service principal or security group in the Azure Active Directory tenant for the vault. The object ID must be unique for the list of access policies. Get it by using Get-AzADUser or Get-AzADServicePrincipal cmdlets.')
param objectId string

@description('principle type')
@allowed([
  'User'
  'ServicePrincipal'
])
param principalType string 

@description('Array of secrets to store in KeyVault')
param secrets array = []

@description('Specifies the permissions to keys in the vault. Valid values are: all, encrypt, decrypt, wrapKey, unwrapKey, sign, verify, get, list, create, update, import, delete, backup, restore, recover, and purge.')
param keysPermissions array = [
  'list'
]

@description('Specifies the permissions to secrets in the vault. Valid values are: all, get, list, set, delete, backup, restore, recover, and purge.')
param secretsPermissions array = [
  'list'
]

resource kv 'Microsoft.KeyVault/vaults@2022-07-01' = {
  name: 'aishop-${uniqueName}'
  location: location
  properties: {
    tenantId: tenantId
    enableSoftDelete: false
    accessPolicies: [
      {
        objectId: objectId
        tenantId: tenantId
        permissions: {
          keys: keysPermissions
          secrets: secretsPermissions
        }
      }
    ]
    sku: {
      name: 'standard'
      family: 'A'
    }
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
}

resource kvsecrets 'Microsoft.KeyVault/vaults/secrets@2022-07-01'  = [for secret in secrets: {
  parent: kv
  name: secret.name
  properties: {
    value: secret.value
  }
}]

@description('This is the built-in Key Vault Administrator role. See https://docs.microsoft.com/azure/role-based-access-control/built-in-roles#key-vault-administrator')
resource keyVaultAdministratorRoleDefinition 'Microsoft.Authorization/roleDefinitions@2018-01-01-preview' existing = {
  scope: subscription()
  name: '00482a5a-887f-4fb3-b363-3b7fe8e74483'
}

// https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/scenarios-rbac#principal
// The principalId property must be set to a GUID that represents the Microsoft Entra identifier for the principal. In Microsoft Entra ID, this is sometimes referred to as the object ID.
resource roleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(kv.id, objectId, keyVaultAdministratorRoleDefinition.id)
  scope: kv
  properties: {
    roleDefinitionId: keyVaultAdministratorRoleDefinition.id
    principalId: objectId
    principalType: principalType
  }
}


output keyVaultUrl string = kv.properties.vaultUri
output secretUris array = [for (secret, i) in secrets:  {
  name: secret.name
  secretUri: kvsecrets[i].properties.secretUri
}]


