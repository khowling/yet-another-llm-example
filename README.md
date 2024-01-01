

# Retail Store with AI

This project showcases how to design, build and deploy webapps, combining the power of both regular programming logic, and GPU based LLMs, giving the user an enhanced natural, feed-based UX that is instantly familour, allowing users to interact with all the services of your business intuativly.

The intended (but not limited) scope of this project will include:
 * `/app/shop` the storefront
 * `/app/factory` factory to create inventry
 * `/app/order` the order processor

The other principles this repo upholds are:

 :heavy_check_mark:  Targeting cloud agnostic dependencies, open-source, open-protocols  
 :heavy_check_mark:  Easily run the whole app on a dev laptop with local dependencies  
 :heavy_check_mark:  Independent and loosly coupled services, with boundaries based on team & data  
 :heavy_check_mark:  Performance, Security, Reliability and Cost are 1st class considerations  
 :heavy_check_mark:  Automated testing & deployments, for PR confidence & blue-green workflows  

![App](./docs/app.jpg)

## To run the project

To run this project, you will need a Linux environment with access to a command shell with `nodejs`. If using Mac, this should be no problem, if using a Windows laptop, use the default Ubuntu distribution on the amazing `WSL`:

 * Follow steps [here](https://learn.microsoft.com/en-us/windows/wsl/install) to install Ubuntu on WSL
 * Then [here](https://code.visualstudio.com/) for Visual Studio, then the VSCode extension for WSL [here](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl)
 * Then steps 1-3 [here](https://github.com/nodesource/distributions?tab=readme-ov-file#installation-instructions) will install ndoejs 

### Dependencies

Now, the application needs a `mongo database` for our business objects and trasactions, a `blob storage` for documents and images and a `few OpenAI services` for the chat experiance.  You can either run these in the cloud (recommended), or run them locally using local emulators (except for the AI dependencies of course). Follow `Setup Dependencies in Cloud (Azure)`, or, if you want to run locally, follow `Install depednecies locally`

> NOTE: If you have an Azure account already or your not familour with installing packages in Linux (it gets involved), is probably eisier to run the dependencies in your Azure subscription

### Option1 : Setup Dependencies in Cloud (Azure)

This repo contains the nesassary scripts to setup all the dependencies you need to run this app, in Azure, at the same time, it creates a local `.env` file will all the nesaccary connection details for the app to run locally, with the dependencies running in Azure.

Ensure you have the Azure [`az cli`](https://learn.microsoft.com/cli/azure/install-azure-cli), installed, and its logged in (`az login`) with an account that has `owner` rights on the subscription.

Now, assuming you have cloned the repo locally, and have changed directory to the repo folder, just execute the following commands set everything up and launch the app: 


```
# Run the Infrastructure templates to provision the dependencies in Azure
bash setup/azure/az.dependencies.sh 5a25 >app/shop/.env

# Run the script to populated the database and storage with the demo catalog
cd app/shop
npm i
npx tsx -r dotenv/config setup/init_config.ts

# Build & run the app
npx tsc
npm start
```

To run & debug the app in VSCode, launch  `VSCode` from the repo folder and run the server as shown in the image below:

```
$ vscode .
```

![VSCode Debug](./docs/vscodedebug.png)



**Any Issues, raise an Issue**


### Option 2 : Install depednecies locally

 of you want to run locally, follow 'Setup Dependencies Local,  for we will also need `mongodb` to store our data, and `azurite` blob storage emulator to store our images and documents.


#### Install mongodb

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

#### Install azurite

instructions here https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=visual-studio-code%2Cblob-storage

**WIP**  This gets complex, with needing https and generate certs :( :(  not a great DX



#### Initialise the database and images


NODE_TLS_REJECT_UNAUTHORIZED=0  node setup/init_config.js



# Appendix

## MongoDB on Azure Options

CosmosDB for Mongo DB now has 2 distinct options (more choices)

implements the wire protocol for MongoDB, currently upto version 4.2. This allows transparent compatibility with MongoDB client SDKs, drivers, and tools, allowing us to use the mongodb libraries in our code.
There are 2 choices, a `vCore` and a `Request Unit (RU)`, the cheapest here is a very small or serverless 'RU' capacity, plus it has a free offer.  

a fully managed MongoDB-compatible database service for building modern applications with a familiar architecture

However, we want a few of the features only in `vCore`, the Vector & Text indexes Search, also there is a free teir with 32GB of storage, and a new 'B' so we can get started for cheap.  This provisions a MongoDB cluster, with version 5 or 6!. It looks like you need to provision it with a server admin and password, does it support Managed Identity??!



##  Roadblock - 

### Container Apps - Private Link support for Workload profiles :(
https://github.com/microsoft/azure-container-apps/issues/867

