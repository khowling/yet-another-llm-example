
@minLength(4)
@maxLength(18)
param uniqueName string

@description('Name of the database to create.')
param dbname string = 'az-shop'

@description('Location for the cluster.')
param location string = resourceGroup().location


@description('The shared throughput for the Mongo DB database')
@minValue(400)
@maxValue(1000000)
param throughput int = 1000


@description('Enable free tier for Mongo DB database, not supported for some subscription types')
param enableFreeTier bool = false

@description('Create Serverless Mongo DB database')
param cosmosServerless bool = true

resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: 'aishop-${uniqueName}'
  kind: 'MongoDB'
  location: location
  properties: {
    enableFreeTier: enableFreeTier
    databaseAccountOfferType: 'Standard'
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    apiProperties: {
      serverVersion: '4.2'
    }
    capabilities: concat([
      {
        name: 'DisableRateLimitingResponses'
      }
    ], !enableFreeTier && cosmosServerless ? [
      {
        name: 'EnableServerless'
      }
    ] : [])
  }
}


resource mongoDB 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases@2023-04-15' = {
  parent: cosmosAccount
  name: dbname
  properties: {
    resource: {
      id: dbname
    }
    options: cosmosServerless ? null :  {
      throughput: throughput
    }
  }
}

var azShopCollections = [
  'products'
  'tenants'
]

resource mongoColl 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases/collections@2023-04-15' = [for collName in azShopCollections: {
  parent: mongoDB
  name: collName
  properties: {
    resource: {
      id: collName
      shardKey: {
        partition_key: 'Hash'
      }
    }
  }
}]


var connectionStrNoDB = split(first(cosmosAccount.listConnectionStrings().connectionStrings).connectionString, '/?')
output cosmosConnectionURL string = '${connectionStrNoDB[0]}/${dbname}?${connectionStrNoDB[1]}'
output cosmosAccountName string = cosmosAccount.name
