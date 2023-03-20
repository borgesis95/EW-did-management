import * as express from "express";
import { AssetsService } from "iam-client-lib";

export default class AssetsController {
  public path = "/assets";
  public router = express.Router();
  private assetService: AssetsService;

  constructor(assetService: AssetsService) {
    this.defineRoutes();
    this.assetService = assetService;
  }

  private defineRoutes() {
    this.router.post(`${this.path}/create`, this.createAssets);
    this.router.get(`${this.path}`, this.getAssets);

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
    const res = await this.assetService.registerAsset();
    const resp = "asset creato: " + res;
    response.send(resp);
  };

  private getAssets = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const res = await this.assetService.getOwnedAssets();

    const respMap = res.map((asset) => {
        return asset.document.id;
    })

    response.send(respMap);
  }
  };
