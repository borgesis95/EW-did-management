import * as express from "express";
import { auth } from "../middleware/auth";
import userModel from "../models/user.model";
import APIresponse from "../response/response";
import ContractService from "../services/contract.service";
export default class AssetsController {
  public path = "/assets";
  public router = express.Router();
  private user = userModel;

  //TODO: Need to be delete from here
  private scService: ContractService;

  constructor() {
    this.defineRoutes();

    // this.assetService = assetService;
    this.scService = new ContractService();
  }

  private defineRoutes() {
    // this.router.post(`${this.path}/create`, this.createAssets);
    // this.router.get(`${this.path}`, this.getAssets);
    this.router.post(`${this.path}/new`, auth, this.newAssets);
    this.router.get(`${this.path}/list`, auth, this.retrieveAssets);
    this.router.get(`${this.path}/contract/list`, this.retrieveOffers);
  }

  /**
   * This is the middleware that call validationjs utils in order
   * to check if parameters added from the user could be valitated
   * @param request
   * @param response
   * @param next
   */
  // private createAssets = async (
  //   request: express.Request,
  //   response: express.Response,
  //   next: express.NextFunction
  // ) => {
  //   const res = await this.assetService?.registerAsset();
  //   const resp = "asset creato: " + res;
  //   response.send(resp);
  // };

  // private getAssets = async (
  //   request: express.Request,
  //   response: express.Response,
  //   next: express.NextFunction
  // ) => {
  //   const res = await this.assetService?.getOwnedAssets();

  //   const respMap = res?.map((asset) => {
  //     return asset.document.id;
  //   });

  //   response.send(respMap);
  // };

  private newAssets = async (
    request: express.Request,
    response: express.Response
  ) => {
    const address = response.locals.user;
    const res = await userModel.findOneAndUpdate(
      { address: address },
      { $push: { assets: request.body } }
    );
    response.send(APIresponse.success("Assets has been created"));
  };

  private retrieveAssets = async (
    request: express.Request,
    response: express.Response
  ) => {
    const address = response.locals.user;
    const res = await userModel.find({ address: address });

    response.send(APIresponse.success(res[0]?.assets));
  };

  private retrieveOffers = async (
    request: express.Request,
    response: express.Response
  ) => {
    const res = await this.scService.getAllOffers();
    console.log("res", res);
    response.send(APIresponse.success(res));
  };
}
