

// create container apps resrource with internal load balancer
param location string = 'westeurope'
param resourceName string = 'khapp2'

resource Vnet 'Microsoft.Network/virtualNetworks@2020-11-01' = {
  name: 'khvnet'
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
  name: 'aca1'
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
  name: '${resourceName}-env'
  location: location
  properties: {
    vnetConfiguration: {
      infrastructureSubnetId: Subnet.id

      // the environment only has an internal load balancer. 
      // These environments do not have a public static IP resource.
      internal: true
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
  name: resourceName
  location: location
  properties: {
    managedEnvironmentId: AcaEnvironment.id
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
          name: 'hello'
        }
      ]
    }
  }
}
