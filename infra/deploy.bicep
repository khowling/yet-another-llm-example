

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


//---------FormRecognizer Construction---------
resource FormRecognizer 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: '${resourcePrefix}-formrecog'
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
resource Translator 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: '${resourcePrefix}-translator'
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

Storage CORS!!!!

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
