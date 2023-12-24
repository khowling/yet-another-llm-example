

# Retail Store with AI

This project showcases how to design, build and deploy webapps, combining the power of both regular programming logic, and GPU based LLMs, giving the user an enhanced natural, feed-based UX that is instantly familour, allowing users to interact with all the services of your business intuativly.

The intended (but not limited) scope of this project will include:
 * `/app/shop` the storefront
 * `/app/factory` factory to create inventry
 * `/app/order` the order processor

The other principles this repo upholds are
 :heavy_check_mark:  Targeting cloud agnostic, open-source, open-protocols, allowing deployment to any cloud where possible
 :heavy_check_mark:  Full offline innerloop development, easily running the whole app on a dev laptop
 :heavy_check_mark:  Independent and loosly coupled services, with boundaries based on team & data transational data needs. (preferene to stateful event-driven state)
 :heavy_check_mark:  Performance, scale-out, security and reliability are 1st class considerations for all components and designs  
 :heavy_check_mark:  Automated testing will be needed for PR confidence & independent environment deployment with blue-green workflows  


## To run the project

To run this project, you will need `nodejs`,  if using a windows laptop, strongly suggest using the default Ubuntu distribution on `WSL`:

 * Follow steps [here](https://learn.microsoft.com/en-us/windows/wsl/install) to install Ubuntu on WSL
 * Then [here](https://code.visualstudio.com/) for Visual Studio, then the VSCode extension for WSL [here](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl)
 * Then steps 1-3 [here](https://github.com/nodesource/distributions?tab=readme-ov-file#installation-instructions) will install ndoejs 

### Dependencies

Now, the application needs a `mongo database` for our business objects and trasactions, a `blob storage` for documents and images and a `few OpenAI services` for the chat experiance.  You can either run these in the cloud (recommended), or run them locally using local emulators (except for the AI dependencies of course). Follow 'Setup Dependencies in Cloud', or, of you want to run locally, follow 'Setup Dependencies Local,

NOTE: If you have an Azure account already and your not familour with setting up a local laptop, is probably eisier to run the dependencies in your Azure subscription

### Option1 : Setup Dependencies in Cloud (Azure)_

This repo contains has a script to setup all the dependencies you need to run this app, in Azure, at the same time, it creates a local `.env` file will all the nesaccary connection details for the app to run.

Ensure you have the `az cli`, installed, and its logged in (`az login`) with an account that has `owner` rights on the subscription.  This is needed as the IaC will create Role Assignements.

Just execute the following commands, the 1st line creates all the Azure dependencies, and the following lines populates `Mongo` and the `Blob Account` with an example catalog.

```
bash setup/az.dependencies.sh 5a25 >app/shop/.env

cd app/shop
npm i
npx tsx -r dotenv/config setup/init_config.ts
```

Now, all you should need to do is open the app in `VSCode`, and run the server

```
$ vscode .
```
![VSCode Debug](./docs/vscodedebug.png)




### Option 2 : Install depednecies locally

 of you want to run locally, follow 'Setup Dependencies Local,  for we will also need `mongodb` to store our data, and `azurite` blob storage emulator to store our images and documents.


### install mongodb

If using Docker:

```
docker volume create --name=mongodata
# a Replica Set single instance
docker run --restart always --name mongo_dev -v mongodata:/data/db -d -p 27017:27017 mongo --replSet rs0
```
else

```
mkdir __mongo_data__
nohup mongod --replSet rs0  --dbpath ./__mongo_data__/ &
```

NOTE: First time only, run to setup the replicaset (needed for the changefeed):
```
mongosh --eval 'rs.initiate({ _id: "rs0", members: [ { _id: 0, host : "localhost:27017" }]})'
```

### Install azurite

instructions here https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=visual-studio-code%2Cblob-storage



# Initialise the database and images


NODE_TLS_REJECT_UNAUTHORIZED=0  node setup/init_config.js



# Appendix

## MongoDB on Azure Options

CosmosDB for Mongo DB now has 2 distinct options (more choices)

implements the wire protocol for MongoDB, currently upto version 4.2. This allows transparent compatibility with MongoDB client SDKs, drivers, and tools, allowing us to use the mongodb libraries in our code.
There are 2 choices, a `vCore` and a `Request Unit (RU)`, the cheapest here is a very small or serverless 'RU' capacity, plus it has a free offer.  

a fully managed MongoDB-compatible database service for building modern applications with a familiar architecture

However, we want a few of the features only in `vCore`, the Vector & Text indexes Search, also there is a free teir with 32GB of storage, and a new 'B' so we can get started for cheap.  This provisions a MongoDB cluster, with version 5 or 6!. It looks like you need to provision it with a server admin and password, does it support Managed Identity??!



#  Roadblock - Private Link support for Workload profiles!!
https://github.com/microsoft/azure-container-apps/issues/867

