

# Retail Store with AI

This repo showcases how webapps can be built in 2024, combining the power of both regular programming logic, and GPU based LLMs, giving the user an enhanced natural, feed-based UX that is instantly familour, allowing users to interact with all the services of our business intuativly.

The intended (but not limited) scope of this project will include
 `/app/shop` the storefront
 `/app/factory` factory to create inventry
 `/app/order` the order processor

The other principles this repo upholds are
 :heavy_check_mark:  Targeting cloud agnostic, open-source, open-protocols, allowing deployment to any cloud where possible
 :heavy_check_mark:  Full offline innerloop development, easily running the whole app on a dev laptop
 :heavy_check_mark:  Independent and loosly coupled services, with boundaries based on team & data transational data needs. (preferene to stateful event-driven state)
 :heavy_check_mark:  Performance, scale-out, security and reliability are 1st class considerations for all components and designs  
 :heavy_check_mark:  Automated testing will be needed for PR confidence & independent environment deployment with blue-green workflows  


## To run locally

To run this project, you will need `nodejs`, strongly suggest using `WSL` if using a windows laptop,  we will also need `mongodb` to store our data, and `azurite` blob storage emulator to store our images and documents.


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




#  Roadblock - Private Link support for Workload profiles!!
https://github.com/microsoft/azure-container-apps/issues/867

