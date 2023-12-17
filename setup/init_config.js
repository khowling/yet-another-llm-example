"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoDB = require("mongodb");
var bson_1 = require("bson");
var stream_1 = require("stream");
var identity_1 = require("@azure/identity");
var storage_blob_1 = require("@azure/storage-blob");
var IMAGE_CONTAINER = process.env.IMAGE_CONTAINER || 'images';
var blobServiceClient = new storage_blob_1.BlobServiceClient(process.env.STORAGE_ACCOUNT ? "https://".concat(process.env.STORAGE_ACCOUNT, ".blob.core.windows.net") : 'https://127.0.0.1:10000/devstoreaccount1', new identity_1.DefaultAzureCredential());
// function getFileClient(store : string, filename: string) : BlockBlobClient {
//     const extension = encodeURIComponent(filename.substring(1 + filename.lastIndexOf(".")))
//     const pathname = `${store}/${(new ObjectId()).toString()}.${extension}`
//     return containerClient.getBlockBlobClient(pathname);
// }
function writeimages(tenent_key, images) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var fileregex, containerClient, imagemap, _i, _b, pathname, b64, bstr, file_stream, extension, filepath, bbClient, err_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    fileregex = /.+\.([^.]+$)/;
                    containerClient = blobServiceClient.getContainerClient(IMAGE_CONTAINER);
                    // Create the container
                    return [4 /*yield*/, containerClient.createIfNotExists()];
                case 1:
                    // Create the container
                    _c.sent();
                    imagemap = new Map();
                    _i = 0, _b = Object.keys(images);
                    _c.label = 2;
                case 2:
                    if (!(_i < _b.length)) return [3 /*break*/, 9];
                    pathname = _b[_i];
                    b64 = Buffer.from(images[pathname], 'base64'), bstr = b64.toString('utf-8'), file_stream = stream_1.Readable.from(bstr), extension = (_a = pathname.match(fileregex)) === null || _a === void 0 ? void 0 : _a[1], filepath = "".concat(tenent_key.toHexString(), "/").concat((new bson_1.ObjectId()).toString(), ".").concat(extension);
                    if (!extension) return [3 /*break*/, 7];
                    console.log("writeimages writing ".concat(filepath));
                    bbClient = containerClient.getBlockBlobClient(filepath);
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, bbClient.uploadStream(file_stream, 4 * 1024 * 1024, 20, {
                            //abortSignal: AbortController.timeout(30 * 60 * 1000), // Abort uploading with timeout in 30mins
                            onProgress: function (ev) { return console.log(ev); }
                        })];
                case 4:
                    _c.sent();
                    console.log("uploadStream succeeds, got ".concat(bbClient.name));
                    imagemap.set(pathname, { pathname: bbClient.name });
                    return [3 /*break*/, 6];
                case 5:
                    err_1 = _c.sent();
                    console.log("uploadStream failed, requestId - ".concat(err_1.details.requestId, ", statusCode - ").concat(err_1.statusCode, ", errorCode - ").concat(err_1.details.errorCode));
                    return [3 /*break*/, 6];
                case 6: return [3 /*break*/, 8];
                case 7:
                    console.error("writeimages: cannoot find extension of image name ".concat(pathname));
                    _c.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 2];
                case 9: return [2 /*return*/, imagemap];
            }
        });
    });
}
var bikes_json_1 = require("./bikes.json");
function populateTenent(db, tenent_key) {
    return __awaiter(this, void 0, void 0, function () {
        var Product, Category, imagemap, catmap, newcats, newproducts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    Product = bikes_json_1.products.Product, Category = bikes_json_1.products.Category;
                    return [4 /*yield*/, writeimages(tenent_key, bikes_json_1.images)];
                case 1:
                    imagemap = _a.sent();
                    catmap = new Map();
                    newcats = Category.map(function (c) {
                        console.log("/createtenent: Processing catalog ".concat(c.heading));
                        var old_id = c._id, new_id = new bson_1.ObjectId(); //.toHexString()
                        var newc = __assign(__assign({}, c), { _id: new_id, partition_key: tenent_key, creation: Date.now() });
                        if (c.image && c.image.pathname) {
                            newc.image = imagemap.get(c.image.pathname);
                            if (!newc.image) {
                                console.error("Cannot find image pathname ".concat(c.image.pathname));
                            }
                        }
                        catmap.set(old_id, new_id);
                        return newc;
                    });
                    console.log("Loading Categories : ".concat(JSON.stringify(newcats)));
                    return [4 /*yield*/, db.collection('products').insertMany(newcats)];
                case 2:
                    _a.sent();
                    newproducts = Product.map(function (p) {
                        console.log("Processing product ".concat(p.heading));
                        var old_id = p._id, new_id = new bson_1.ObjectId(); //.toHexString()
                        var newp = __assign(__assign({}, p), { _id: new_id, partition_key: tenent_key, creation: Date.now() });
                        if (p.category_id) {
                            newp.category_id = catmap.get(p.category_id);
                            if (!newp.category_id) {
                                console.error("Cannot find category ".concat(p.category_id));
                            }
                        }
                        if (p.image && p.image.pathname) {
                            newp.image = imagemap.get(p.image.pathname);
                            if (!newp.image) {
                                console.error("Cannot find image pathname ".concat(p.image.pathname));
                            }
                        }
                        return newp;
                    });
                    console.log("Importing Products");
                    return [4 /*yield*/, db.collection('products').insertMany(newproducts)
                        /*
                            if (value.inventory) {
                                await ctx.db.collection(StoreDef["inventory"].collection).insertMany(newproducts.map(function (p) {
                                    return {
                                        _ts: new Timestamp(0,0), // Empty timestamp will be replaced by the server to the current server time
                                        partition_key: new_tenent.insertedId,
                                        status: 'Required',
                                        product_id: p._id,
                                        category_id: p.category_id,
                                        warehouse: 'EMEA',
                                        qty: 1
                                    }
                                }))
                            }
                        */
                    ];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
var tenent_key = 'root';
var tenent_def = {
    name: process.argv[2] || "Developer Local Test Store",
    image: { url: process.argv[3] || 'https://assets.onestore.ms/cdnfiles/onestorerolling-1511-11008/shell/v3/images/logo/microsoft.png' },
    inventory: true,
    catalog: 'bike'
};
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var client, db, new_tenent, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    client = new mongoDB.MongoClient(process.env.DB_CONN_STRING || 'mongodb://localhost:27017/azshop');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 9]);
                    return [4 /*yield*/, client.connect()];
                case 2:
                    _a.sent();
                    db = client.db(process.env.DB_NAME);
                    console.log('Connected to the database, creating local developer tenent');
                    console.log("tear down existing config");
                    return [4 /*yield*/, db.collection('business').deleteMany({ partition_key: tenent_key })
                        // Create new details.
                    ];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, db.collection('business').insertOne(__assign(__assign({}, tenent_def), { type: "business", partition_key: tenent_key }))
                        // Perform database operations here
                    ];
                case 4:
                    new_tenent = _a.sent();
                    // Perform database operations here
                    return [4 /*yield*/, populateTenent(db, new_tenent.insertedId)];
                case 5:
                    // Perform database operations here
                    _a.sent();
                    return [3 /*break*/, 9];
                case 6:
                    error_1 = _a.sent();
                    console.error('Error connecting to the database:', error_1);
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, client.close()];
                case 8:
                    _a.sent();
                    console.log('Disconnected from the database');
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
main();
