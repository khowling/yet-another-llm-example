

# Retail Store with AI

Example repo demonstrating how to build modern cloud-agnostic applications, incorporating AI with traditional web technologies, incorporating clear, concise instructions on how to run locally, deploy to cloud, and contribute.

The principles this repo upholds are:

 :heavy_check_mark:  Cloud agnostic where practical, open-source, open-protocols  
 :heavy_check_mark:  Run the app fully locally (without Docker), gracefully handling and missing dependencies (ie. OpenAI)  
 :heavy_check_mark:  Independent and loosely coupled services, with boundaries based on data and functional areas  
 :heavy_check_mark:  Performance, Security, Reliability and Cost 1st class considerations  
 :heavy_check_mark:  Automated testing & deployments, for PR confidence & blue-green workflows  


![App](./docs/app.jpg)


The intended scope of this project will include:
 * `/app/shop` the storefront (available today)
 * `/app/factory` factory to create inventory (future)
 * `/app/order` the order processor (future)



## To quickly run the app in your Azure Subscription

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fkhowling%2Fai-shop%2Fdeploy-button%2Fazuredeploy.json)

The project's `setup` directory contains IaC (Infra-as-Code) to quickly bootstrap the demo into your Azure subscription.  The IaC files provisions all the resources you need to run the project & builds the initial container using [Azure Container Registry Tasks](https://learn.microsoft.com/azure/container-registry/container-registry-tasks-overview), deploying to [Azure Container Apps](https://learn.microsoft.com/azure/container-apps/overview).

The easiest way to deploy is using the *Azure Cloud shell*, as this has the Azure CLI already installed & logged in.  If you already have the az cli installed locally, just run on your local Linux shell:

* **Step 1** : goto [Azure Cloud Shell](https://shell.azure.com), and once you have a `$` prompt,

* **Step 2** : Run the following to deploy. 

    >NOTE: Change `westeurope` to the region of your choice
   ```sh
   # Set region and a unique name for the deployment
   location="westeurope"
   uniqueName=$(printf '%05x' $RANDOM)
   rgName="aishop-${uniqueName}"

   # Create resource group
   az group create -n $rgName -l $location

   # Deploy
   az deployment group create -g $rgName --template-uri https://github.com/khowling/ai-shop/releases/download/0.0.3/main.json --parameters uniqueName=${uniqueName} repoUrl=https://github.com/khowling/ai-shop.git
   ```

   You should see a `/ Running ..` prompt, that, if all goes well will last for about 5minutes to complete successfully, and return a large json output.

* **Step** 3 : Open the app in your browser!  
   * Open `portal.azure.com`, and you should see a new resource group called **`aishop-xxxxx`** containing:

      ![Resources](./docs/azresources.png)

   * Navigate to the `aishop` `Container App` resource
   * Click on the `Application Url` in the top right conner of the overview tab.  You should see your app.

      > NOTE: Any issues, please log a issue against this github repo, and we'll get to it asap.

## To run the project locally on your laptop (If you want to change/contribute)

To run this project as a developer, you will need a Linux environment with access to a command shell with [Bun](https://bun.sh/). If using Mac, this should be no problem, if using a Windows laptop, use the default Ubuntu distribution on the amazing [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/about):

 * Follow steps [here](https://learn.microsoft.com/en-us/windows/wsl/install) to install Ubuntu on WSL
 * Then [here](https://code.visualstudio.com/) for Visual Studio Code, then the VSCode extension for WSL [here](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl)
 * Then  [here](https://bun.sh/docs/installation) to install Bun 

### Dependencies

To run the app, you need a `mongo database` for our business objects, a `blob storage` account for documents and images, and a `few OpenAI services` for the chat experience.  You can run these in the cloud, or run them locally using mongo & local storage emulator `azurite` (cant run the AI dependencies locally of course). Follow `Option1 : Run app locally with Dependencies in Cloud`, or,  `Option 2 : Install dependencies locally`


### Option1 : Run app locally with Dependencies in Cloud (Azure)

This repo contains the necessary bicep scripts to setup all the Azure dependencies you need to run this app locally. 

Ensure you have cloned the repo locally, and you have the Azure [`az cli`](https://learn.microsoft.com/cli/azure/install-azure-cli), installed, and its logged in (`az login`) with an account that has `owner` rights on your subscription.

Now, assuming you have cloned the repo locally, and have changed directory to the repo folder, just execute the following commands set everything up and launch the app: 

 > NOTE: If you have already followed the 3 steps to deploy the app to Azure at the top of this README, and would like to re-use the same dependencies when you are running locally,  ensure you specify the same region and set the `uniqueName` to the same 5 digit unique string that was generated during the initial deployment, otherwise, just leave it unset and the script will automatically generate a new uniqueName for you & create a new set of resources.
 > ```sh
 > uniqueName="xxxxx"
 > ``` 

```
# Set your region
location="westeurope"

# Run the Infrastructure templates to provision the dependencies in Azure
bash setup/azure/az.dependencies.sh $location $uniqueName >app/shop/.env

# Build & run the app
cd app/shop
bun install
npm run dev
```

To run & debug the app in VSCode, launch  `VSCode`, and using the `WSL Remote` extension, open the WLS folder where the project is cloned, and run `Launch Bun` like in the image below:


![VSCode Debug](./docs/vscodedebug.png)


### To load in a new Catalog / System prompt

Use this command to load in a new configuration, or update the existing config.  Including Catalog Items, AI System prompt, branding etc

 > NOTE:
 > you can either use the `setup/food.json` or `setup/bikes.json` arguments to the `init_config` below for different starting catalogs.

```
# Run the script to populate the database and storage with the demo catalog
bun src/init_config.ts setup/food.json
```

### To Build and Deploy a new revision of the app


Build the application container from your locally cloned source code, and push to your Azure Container Registry, all in one step using [Azure Container Registry Tasks](https://learn.microsoft.com/azure/container-registry/container-registry-tasks-overview).

Ensure you are in the root directory of the project, and run:

```
(source app/shop/.env && 
   tag=$(date +%s)
   az acr build -r $AISHOP_ACR_NAME -t aishop/shop:$tag  app/shop &&
   az containerapp revision copy -n $AISHOP_ACA_NAME -g $AISHOP_RG_NAME --image $AISHOP_ACR_NAME.azurecr.io/aishop/shop:$tag
)
```


**Any Issues, raise an Issue**


### Option 2 : Install dependencies locally - * UNDER CONSTRUCTION *

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




# Appendix

## MongoDB on Azure Options

CosmosDB for Mongo DB now has 2 distinct options (more choices)

implements the wire protocol for MongoDB, currently upto version 4.2. This allows transparent compatibility with MongoDB client SDKs, drivers, and tools, allowing us to use the mongodb libraries in our code.
There are 2 choices, a `vCore` and a `Request Unit (RU)`, the cheapest here is a very small or serverless 'RU' capacity, plus it has a free offer.  

a fully managed MongoDB-compatible database service for building modern applications with a familiar architecture

However, we want a few of the features only in `vCore`, the Vector & Text indexes Search, also there is a free teir with 32GB of storage, and a new 'B' so we can get started for cheap.  This provisions a MongoDB cluster, with version 5 or 6!. It looks like you need to provision it with a server admin and password, does it support Managed Identity??!

## If you have docker locally (not a requirement for this project, as it should be:) )
```
# As a example to build locally, and run a shell in the container (if you have docker installed)
docker build -t shop aishop/shop:localdev01
docker run -it --entrypoint /bin/sh aishop/shop:localdev01
```


##  Roadblock - 

### Container Apps - Private Link support for Workload profiles :(
https://github.com/microsoft/azure-container-apps/issues/867

