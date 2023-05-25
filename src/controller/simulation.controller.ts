import * as express from "express";
import SimulationService from "../services/simulation.service";
import APIresponse from "../response/response";

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

  private runSimulation = async (
    request: express.Request,
    response: express.Response
  ) => {
    const result = await this.simulationService.runSimulation();
    response.send(APIresponse.success(result));
  };
}
