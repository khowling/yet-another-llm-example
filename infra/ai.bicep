


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
