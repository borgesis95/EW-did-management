import * as express from "express";
import SmartMeterService from "../services/smart-meter.service";
import ContractService from "../services/contract.service";
import { MarketDto } from "../@types/express/interface";
import APIresponse from "../response/response";
import transactionModel from "../models/transaction.model";
import { auth } from "../middleware/auth";
import OfferModel from "../models/offers.model";
import DemandsModel from "../models/demands.model";
import AssetsService from "../services/assets.service";
import MatchingService from "../services/matching.service";

const OFFERS_MOCK = [
  {
    user: "0x17d9c6D7834c35CedE6F63bD05A69E331cdDc77d",
    canSell: 30,
    price: "20",
  },
  {
    user: "0xB355D6fCF8F2fe13c47E69B015E78cd637eE64C5",
    canSell: 22,
    price: "24",
  },
];

const DEMANDS_MOCK = [
  {
    user: "0xa45eEfC39deE659c85C5D640F85db344fACC3d6f",
    wantBuy: 13,
    price: "25",
  },
  {
    user: "0x7Da883e189f3f14Bd8A31B8d6712dbA3bC36E8b0",
    wantBuy: 19,
    price: "46",
  },
];
export default class GridController {
  public path = "/grid";
  public router = express.Router();
  public smartMeterService: SmartMeterService;
  public contractService: ContractService;
  public assetService: AssetsService;
  private transactionModel = transactionModel;
  private offerModel = OfferModel;
  private demandsModel = DemandsModel;
  private matchingService: MatchingService;

  constructor() {
    this.defineRoutes();
    this.smartMeterService = new SmartMeterService("");
    this.contractService = new ContractService();
    this.assetService = new AssetsService();
    this.matchingService = new MatchingService();
  }

  private defineRoutes() {
    this.router.get(`${this.path}/matching`, this.matching);
    this.router.get(`${this.path}/list`, this.getMatch);
    this.router.get(`${this.path}/average`, this.getAveragePriceOffer);
    this.router.get(
      `${this.path}/meter-simulation/:hours`,
      this.getSmartMetersSimulation
    );

    this.router.get(`${this.path}/transactions`, auth, this.getTransactions);
    this.router.post(`${this.path}/offer`, this.createOffer);
    this.router.post(`${this.path}/bid`, this.createBid);
  }

  private matching = async (
    request: express.Request,
    response: express.Response
  ) => {
    const result = await this.matchingService.matching();

    response.send(APIresponse.success(result));
  };

  private getMatch = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const match = await this.contractService.getTransactionMoneyByAddress(
      "0x8D18c885db1138bC80A3f5E6343510bc93fB41A8"
    );

    res.send(match);
  };

  /**This route is useful just for test situation and need to be deleted */
  private getSmartMetersSimulation = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const response = this.smartMeterService.solarEnergyCurve(new Date());
    res.send(response);
  };

  /**
   *
   * @param offerPrice
   * @param demandPrice
   * @param energyBought
   * @param energyAvaiableFromProsumer
   */

  private getTransactions = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const address = response.locals.user;

    const res = await transactionModel.find({
      address: address,
    });

    response.send(APIresponse.success(res));
  };

  private getAveragePriceOffer = async (
    request: express.Request,
    response: express.Response
  ) => {
    const offers = await this.offerModel.find({});
    const bids = await this.demandsModel.find({});

    const initialOfferValue = 0;
    let averageOffersPrice = offers.reduce(
      (accumulator: number, item: any) => accumulator + parseInt(item.price),
      initialOfferValue
    );

    averageOffersPrice = averageOffersPrice / offers.length;

    let averageBidsPrice = bids.reduce(
      (accumulator: number, item: any) => accumulator + parseInt(item.price),
      initialOfferValue
    );

    averageBidsPrice = averageBidsPrice / offers.length;

    response.send(
      APIresponse.success({
        bids: averageBidsPrice,
        offers: averageOffersPrice,
      })
    );
  };

  private createOffer = async (req: express.Request, res: express.Response) => {
    const request: MarketDto = req.body;

    let options = { upsert: true, new: true, setDefaultsOnInsert: true };

    const response = await this.offerModel.findOneAndUpdate(
      { address: request.address },
      request,
      options
    );

    res.send(
      APIresponse.success({
        response,
      })
    );
  };

  private createBid = async (req: express.Request, res: express.Response) => {
    const request: MarketDto = req.body;

    let options = { upsert: true, new: true, setDefaultsOnInsert: true };

    const response = await this.demandsModel.findOneAndUpdate(
      { address: request.address },
      request,
      options
    );

    res.send(
      APIresponse.success({
        response,
      })
    );
  };
}
