import dotenv from "dotenv";
// import {
//   initWithPrivateKeySigner,
//   MessagingMethod,
//   setChainConfig,
//   setMessagingConfig,
//   setCacheConfig,
// } from "iam-client-lib";
import App from "./app";
import AssetsController from "./controller/assets.controller";
import { config, VOLTA_CHAIN_ID } from "./config/config";
import UserController from "./controller/users.controller";
import GridController from "./controller/grid.controller";
import ContractController from "./controller/contract.controller";

dotenv.config();

// const key = process.env.PRIVATE_KEY || "";
// const rpc = process.env.RPC_URL || "";

// const IamConfiguration = async () => {
//   const { signerService, messagingService, connectToCacheServer } =
//     await initWithPrivateKeySigner(key, config.chainRpcUrl);

//   setChainConfig(VOLTA_CHAIN_ID, {
//     rpcUrl: config.chainRpcUrl,
//   });

//   // setMessagingConfig(VOLTA_CHAIN, {
//   //   messagingMethod: MessagingMethod.Nats,
//   //   natsServerUrl: 'https://some-exchange-server.com',
//   // });

//   setCacheConfig(VOLTA_CHAIN_ID, {
//     url: config.cacheServerUrl,
//   });

//   const {
//     cacheClient,
//     domainsService,
//     connectToDidRegistry,
//     verifiableCredentialsService,
//     assetsService,
//   } = await connectToCacheServer();

const port = parseInt(process.env.PORT || "3000");

const app = new App(
  [
    new AssetsController(),
    new UserController(),
    new GridController(),
    new ContractController(),
  ],
  port
);

app.listen();
// };

// IamConfiguration();
