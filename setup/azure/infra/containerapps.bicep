
@minLength(4)
@maxLength(18)
param uniqueName string

@description('Location for the cluster.')
param location string = resourceGroup().location
/*
@description('Specifies the object ID of a user, service principal or security group in the Azure Active Directory tenant for the vault. The object ID must be unique for the list of access policies. Get it by using Get-AzADUser or Get-AzADServicePrincipal cmdlets.')
param objectId string

@description('principle type')
@allowed([
  'User'
  'ServicePrincipal'
])
param principalType string 
*/

@description('The resource id of the managed identity to be used for the container app.')
param managedIdentityId string


@description('ACR Name for ACA')
param acrName string

@description('The container name')
param acrImage string

@description('Environment Config')
param env array

@description('Key Vault Secret Uris')
param kvSecretUris array

var acaSubnetName = 'aca'

resource Vnet 'Microsoft.Network/virtualNetworks@2020-11-01' = {
  name: '${uniqueName}-net'
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: [
        '10.0.0.0/16'
      ]
    }
    subnets: [
      {
        name: acaSubnetName
        properties: {
          addressPrefix: '10.0.1.0/27'
          delegations:  [
            {
              name: 'aca'
              properties: {
                serviceName: 'Microsoft.App/environments'
              }
            }
          ]
        }
      }
    ]
  }
}

// Resolves : https://github.com/Azure/bicep-types-az/issues/1687
resource acaSubnet 'Microsoft.Network/virtualNetworks/subnets@2021-02-01' existing = {
  name: acaSubnetName
  parent: Vnet
}

resource AcaEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: '${uniqueName}-acaenv'
  location: location
  properties: {
    vnetConfiguration: {
      infrastructureSubnetId: acaSubnet.id

      // the environment only has an internal load balancer. 
      // These environments do not have a public static IP resource.
      internal: false
    }
    workloadProfiles: [
      {
        workloadProfileType: 'Consumption'
        name: 'Consumption'
      }
    ]
    zoneRedundant: false
  }
}


resource containerapp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'aishop'
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${managedIdentityId}': {}
    }
  }
  properties: {
    environmentId: AcaEnvironment.id
    configuration: {
      registries: [
        {
            server: '${acrName}.azurecr.io'
            identity: managedIdentityId
        }
      ]
      secrets: map(kvSecretUris, (kvSecretUri) => {
          identity: managedIdentityId
          keyVaultUrl: kvSecretUri.secretUri
          name: kvSecretUri.name
      })
      ingress: {

        // can accept traffic from VNET
        external: true
        allowInsecure: true
        transport: 'http'
        targetPort: 80
      }
    }
    template: {
      containers: [
        {
          image: acrImage
          name: 'ui'
          env: concat(env, map(kvSecretUris, (kvSecretUri) => {
              name: kvSecretUri.env
              secretRef: kvSecretUri.name
          }))
        }
      ]
    }
  }
}


