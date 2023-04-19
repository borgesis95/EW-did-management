import * as express from "express";
import SmartMeterService from "../services/smart-meter.service";
import ContractService from "../services/contract.service";
import { EnergyData } from "../models/energy.model";
import { EnergyMatchingDto } from "../@types/express/interface";

interface ProsumerOffer {
  /** Define user which created offer  */
  user: string;
  /* Describe how much energy can sell to other consumers */
  canSell: number;
  price: string;
}

interface ConsumerBid {
  user: string;
  wantBuy: number;
  price: string;
}

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

  constructor() {
    this.defineRoutes();
    this.smartMeterService = new SmartMeterService("");
    this.contractService = new ContractService();
  }

  private defineRoutes() {
    this.router.get(`${this.path}/matching`, this.matchingAlgorithm);
    this.router.get(`${this.path}/list`, this.getMatch);
  }

  private matchingAlgorithm = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const users = await this.smartMeterService.retrieveUsersAndPush();
    const offersList = await this.contractService.getAllOffers();
    const bidsList = await this.contractService.getBids();

    /**Filter user that has negative differ and needs energy from others prosumers */
    const usersNeedsEnergy = users.filter((user) => user.diff < 0);
    /* User who producted more energy than needed */
    const prosumers = users.filter((user) => user.diff > 0);

    const prosumerCanSellEnergyList =
      this.filterProsumersThatCanSellEnergyAndHasOffers(users, offersList);

    const consumersWantEnergyList = this.filterConsumersWantBuyEnergyFromP2p(
      users,
      bidsList
    );

    const energyTransactionList = this.clearMarket(DEMANDS_MOCK, OFFERS_MOCK);

    // energyTransactionList.forEach(async (match) => {
    //   await this.contractService.addMatching(match);
    // });

    this.contractService.addMatching(energyTransactionList);

    response.send(energyTransactionList);
  };

  private filterProsumersThatCanSellEnergyAndHasOffers = (
    energyDataInfo: EnergyData[],
    offers: any[]
  ): ProsumerOffer[] => {
    /* User who producted more energy than needed */
    const prosumers = energyDataInfo.filter(
      (energyInfo) => energyInfo.diff > 0
    );

    const prosumersOffers = offers.map((item: any) => {
      const prosumerWithOfferCreated = prosumers.find(
        (prosumer) => prosumer.user_id === item.user
      );
      if (prosumerWithOfferCreated) {
        return {
          user: prosumerWithOfferCreated.user_id,
          canSell: prosumerWithOfferCreated.diff,
          price: item.minPrice,
        } as ProsumerOffer;
      }
    }) as ProsumerOffer[];

    return prosumersOffers.filter((prosOffers) => prosOffers !== undefined);
  };

  private filterConsumersWantBuyEnergyFromP2p = (
    energyDataInfo: EnergyData[],
    bids: any[]
  ) => {
    /* User who producted more energy than needed */
    const consumers = energyDataInfo.filter(
      (energyInfo) => energyInfo.diff < 0
    );

    const consumerBids = bids.map((item: any) => {
      const consumerWithBidsCreated = consumers.find(
        (prosumer) => prosumer.user_id === item.user
      );

      if (consumerWithBidsCreated) {
        return {
          user: consumerWithBidsCreated.user_id,
          wantBuy: Math.abs(consumerWithBidsCreated.diff),
          price: item.maxPrice,
        } as ConsumerBid;
      }
    }) as ConsumerBid[];

    return consumerBids.filter((prosOffers) => prosOffers !== undefined);
  };

  /**
   * Method that will be used to matching demands and response
   */
  private clearMarket(demands: ConsumerBid[], offers: ProsumerOffer[]) {
    // console.log("OFFERS", offers);
    // console.log("DEMANDS", demands);

    console.log("--- START ALGORITHM ---", "\n\n");
    /* Order Request by price . In this way the algorithm will give
      priority to consumers which are willing to pay more to obtain electricity.
      Of course could be applied other type of computation 
    */

    let energyExchangeList: EnergyMatchingDto[] = [];
    const demandsByHighestPrice = demands?.sort((a, b) => {
      if (a.price < b.price) return 1;
      else return -1;
    });

    const offersByLowestPrice = offers?.sort((a, b) => {
      if (a.price > b.price) return 1;
      else return -1;
    });

    for (let i = 0; i < demandsByHighestPrice.length; i++) {
      console.log("\n\n");
      console.log("demands[i]", demands[i]);

      for (let j = 0; j < offersByLowestPrice.length; j++) {
        console.log("offer[j]", offers[j]);

        if (
          demands[i].wantBuy !== 0 &&
          offers[j].canSell !== 0 &&
          offers[j].price <= demands[i].price
        ) {
          if (offers[j].canSell >= demands[i].wantBuy) {
            const totalEnergyTransfer = demands[i].wantBuy;
            const powerRemained = offers[j].canSell - totalEnergyTransfer;

            demands[i].wantBuy = totalEnergyTransfer - demands[i].wantBuy;
            offers[j].canSell = powerRemained;

            console.log(
              `${demands[i].user} will buy ${totalEnergyTransfer} from ${offers[i].user} , power remained to sell : ${powerRemained}`
            );

            energyExchangeList.push({
              from: offers[i].user,
              to: demands[i].user,
              quantity: totalEnergyTransfer,
              price: totalEnergyTransfer * parseInt(offers[j].price),
            });
          } else {
            const totalEnergyTransfer = offers[j].canSell;
            offers[j].canSell = 0;
            demands[i].wantBuy = demands[i].wantBuy - totalEnergyTransfer;

            console.log(
              `${demands[i].user} will buy ${totalEnergyTransfer} from ${offers[i].user} , power remained to buy : ${demands[i].wantBuy}`
            );

            energyExchangeList.push({
              from: offers[i].user,
              to: demands[i].user,
              quantity: totalEnergyTransfer,
              price: totalEnergyTransfer * parseInt(offers[j].price),
            });
          }
        }
      }
    }

    console.log("enegyExchangeList", energyExchangeList);
    // console.log("DEMANDS", demands);
    // console.log("OFFERS", offers);
    return energyExchangeList;
  }

  private getMatch = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const match = await this.contractService.getMatch();
    console.log("match:", match);
    res.send(match);
  };
}
