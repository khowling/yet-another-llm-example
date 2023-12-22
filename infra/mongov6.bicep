

@minLength(4)
@maxLength(22)
param uniqueName string

@description('Location for the cluster.')
param location string = resourceGroup().location

@description('Username for admin user')
param adminUsername string

@secure()
@description('Password for admin user')
@minLength(8)
@maxLength(128)
param adminPassword string

var mongov6Name = '${uniqueName}-mongov6'

resource mongov6 'Microsoft.DocumentDB/mongoClusters@2023-03-01-preview' = {
  name: mongov6Name
  location: location
  tags: {
    insance: uniqueName
    app: 'azshop'
  }
  properties: {
    administratorLogin: adminUsername
    administratorLoginPassword: adminPassword
    createMode: 'Default'

    nodeGroupSpecs: [
      {
        diskSizeGB: 32
        enableHa: false
        kind: 'Shard'
        nodeCount: 1
        sku: 'Free'
      }
    ]
    restoreParameters: {
      pointInTimeUTC: 'string'
      sourceResourceId: 'string'
    }
    serverVersion: '6.0.0'
  }
}

resource mongov6firewall 'Microsoft.DocumentDB/mongoClusters/firewallRules@2023-03-01-preview' = {
  name: 'allowAll'
  parent: mongov6
  properties: {
    endIpAddress: '0.0.0.0'
    startIpAddress: '255.255.255.255'
  }
}


