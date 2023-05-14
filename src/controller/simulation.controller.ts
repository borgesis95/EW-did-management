import * as express from "express";
import SimulationService from "../services/simulation.service";

export default class SimulationController {
  public path = "/simulation";
  public router = express.Router();
  private simulationService;

  constructor() {
    this.defineRoutes();
    this.simulationService = new SimulationService();
  }

  private defineRoutes() {
    this.router.get(`${this.path}/run`, this.runSimulation);
  }

  private runSimulation = (
    request: express.Request,
    response: express.Response
  ) => {
    this.simulationService.runSimulation();
    response.send("Simulazione lanciata");
  };
}
