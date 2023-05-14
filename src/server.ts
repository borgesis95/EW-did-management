import dotenv from "dotenv";
import App from "./app";
import AssetsController from "./controller/assets.controller";
import UserController from "./controller/users.controller";
import GridController from "./controller/grid.controller";
import ContractController from "./controller/contract.controller";
import SimulationController from "./controller/simulation.controller";

dotenv.config();

const port = parseInt(process.env.PORT || "3000");

const app = new App(
  [
    new AssetsController(),
    new UserController(),
    new GridController(),
    new ContractController(),
    new SimulationController(),
  ],
  port
);

app.listen();
