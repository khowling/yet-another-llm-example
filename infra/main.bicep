
@minLength(4)
@maxLength(22)
param uniqueName string

@description('Location for the cluster.')
param location string = resourceGroup().location

@description('Username for mongo admin user')
param mongoAdminUser string = 'admin'

@secure()
@description('Password for mongo admin user')
@minLength(8)
@maxLength(128)
param mongoAdminPassword string



resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2018-11-30' = {
  name: '${uniqueName}-mi'
  location: location
}

module kv './keyvault.bicep' = {
  name: 'deploy-keyvault'
  params: {
    uniqueName: uniqueName
    location: location
    adminPassword: mongoAdminPassword
    objectId: managedIdentity.properties.principalId
  }
}

module cosmos './mongov6.bicep' = {
  name: 'deploy-mongov6'
  params: {
    uniqueName: uniqueName
    location: location
    adminUsername: mongoAdminUser
    adminPassword: mongoAdminPassword
  }
}

module storage 'storage.bicep' = {
  name: 'deploy-storage'
  params: {
    uniqueName: uniqueName
    location: location
    objectId: managedIdentity.properties.principalId
  }
}

