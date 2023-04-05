import * as express from "express";
import { AssetsService } from "iam-client-lib";
import { auth } from "../middleware/auth";
import userModel from "../models/user.model";
import APIresponse from "../response/response";
export default class AssetsController {
  public path = "/assets";
  public router = express.Router();
  private assetService?: AssetsService;
  private user = userModel;

  constructor(assetService?: AssetsService) {
    this.defineRoutes();
    this.assetService = assetService;
  }

  private defineRoutes() {
    this.router.post(`${this.path}/create`, this.createAssets);
    this.router.get(`${this.path}`, this.getAssets);
    this.router.post(`${this.path}/new`, auth, this.newAssets);
  }

  /**
   * This is the middleware that call validationjs utils in order
   * to check if parameters added from the user could be valitated
   * @param request
   * @param response
   * @param next
   */
  private createAssets = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const res = await this.assetService?.registerAsset();
    const resp = "asset creato: " + res;
    response.send(resp);
  };

  private getAssets = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const res = await this.assetService?.getOwnedAssets();

    const respMap = res?.map((asset) => {
      return asset.document.id;
    });

    response.send(respMap);
  };

  private newAssets = async (
    request: express.Request,
    response: express.Response
  ) => {
    console.log("request.body", request.body);
    const address = response.locals.user;
    const res = await userModel.findOneAndUpdate(
      { address: address },
      { $push: { assets: request.body } }
    );
    response.send(APIresponse.success("Assets has been create"));
  };
}
