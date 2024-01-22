
@minLength(4)
@maxLength(18)
param uniqueName string

@description('Location for the cluster.')
param location string = resourceGroup().location

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

output acaEnvId string = AcaEnvironment.id
