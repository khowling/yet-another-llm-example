
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


resource Vnet 'Microsoft.Network/virtualNetworks@2020-11-01' = {
  name: '${uniqueName}-net'
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: [
        '10.0.0.0/16'
      ]
    }
  }
}


resource Subnet 'Microsoft.Network/virtualNetworks/subnets@2020-11-01' = {
  name: 'aca'
  parent: Vnet
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

resource AcaEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: '${uniqueName}-acaenv'
  location: location
  properties: {
    vnetConfiguration: {
      infrastructureSubnetId: Subnet.id

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
  name: '${uniqueName}-hello'
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${objectId}': {}
    }
  }
  properties: {
    environmentId: AcaEnvironment.id
    configuration: {
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
          image: 'nginxdemos/hello'
          name: 'placeholder'
        }
      ]
    }
  }
}


