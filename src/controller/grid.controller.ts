import * as express from "express";
import SmartMeterService from "../services/smart-meter.service";
import ContractService from "../services/contract.service";
import { EnergyData } from "../models/energy.model";
import { EnergyMatchingDto, TransactionDto } from "../@types/express/interface";
import APIresponse from "../response/response";
import transactionModel from "../models/transaction.model";
import { auth } from "../middleware/auth";

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
  private transactionModel = transactionModel;

  constructor() {
    this.defineRoutes();
    this.smartMeterService = new SmartMeterService("");
    this.contractService = new ContractService();
  }

  private defineRoutes() {
    this.router.get(`${this.path}/matching`, this.matchingAlgorithm);
    this.router.get(`${this.path}/list`, this.getMatch);
    this.router.get(
      `${this.path}/meter-simulation/:hours`,
      this.getSmartMetersSimulation
    );

    this.router.get(`${this.path}/transactions`, auth, this.getTransactions);
  }

  private matchingAlgorithm = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const smartMetersMisurations =
        await this.smartMeterService.retrieveUsersAndPush(true);
      const offersList = await this.contractService.getAllOffers();
      const bidsList = await this.contractService.getBids();

      console.log("smart meter misuration:", smartMetersMisurations);

      const prosumerCanSellEnergyList =
        this.filterProsumersThatCanSellEnergyAndHasOffers(
          smartMetersMisurations,
          offersList
        );

      const consumersWantEnergyList = this.filterConsumersWantBuyEnergyFromP2p(
        smartMetersMisurations,
        bidsList
      );

      const energyTransactionList = this.clearMarket(
        consumersWantEnergyList,
        prosumerCanSellEnergyList
      );

      const transactions = this.formatTransactions(energyTransactionList);
      /**Add response to mongodb in order to get information to user about  what happen*/
      await transactionModel.insertMany(transactions);

      /**Save transaction on BC */

      transactions.forEach(async (it) => {
        await this.contractService.addTransactionPayment(
          it.address,
          parseInt(it.price.toFixed(2))
        );
      });

      response.send(energyTransactionList);
    } catch (error) {
      console.error(error);
      response
        .status(500)
        .send(APIresponse.success({}, "something went wrong", 500));
    }
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
        (prosumer) => prosumer.user_id === item.user.toLowerCase()
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
        (prosumer) => prosumer.user_id === item.user.toLowerCase()
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
    console.log("--- START ALGORITHM ---", "\n\n");
    /* Order Request by price . In this way the algorithm will give
      priority to consumers which are willing to pay more to obtain electricity.
      Of course could be applied other type of computation 
    */

    let energyExchangeList: EnergyMatchingDto[] = [];
    const demandsByHighestPrice = demands?.sort((a, b) => {
      if (parseInt(a.price) < parseInt(b.price)) return 1;
      else return -1;
    });

    const offersByLowestPrice = offers?.sort((a, b) => {
      if (parseInt(a.price) > parseInt(b.price)) return 1;
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
          parseInt(offers[j].price) <= parseInt(demands[i].price) // minPrice << MaxPrice
        ) {
          if (offers[j].canSell >= demands[i].wantBuy) {
            const totalEnergyRemain = offers[j].canSell;
            const totalEnergyTransfer = demands[i].wantBuy;
            const powerRemained = offers[j].canSell - totalEnergyTransfer;

            demands[i].wantBuy = totalEnergyTransfer - demands[i].wantBuy;
            offers[j].canSell = powerRemained;

            console.log(
              `${demands[i].user} will buy ${totalEnergyTransfer} from ${offers[j].user} , power remained to sell : ${powerRemained}`
            );

            energyExchangeList.push({
              from: offers[j].user,
              to: demands[i].user,
              quantity: totalEnergyTransfer,
              price:
                totalEnergyTransfer *
                this.buildPrice(
                  parseInt(offers[j].price),
                  parseInt(demands[i].price),
                  totalEnergyTransfer,
                  totalEnergyRemain
                ),
            });
          } else {
            const totalEnergyTransfer = offers[j].canSell;
            offers[j].canSell = 0;
            demands[i].wantBuy = demands[i].wantBuy - totalEnergyTransfer;

            console.log(
              `${demands[i].user} will buy ${totalEnergyTransfer} from ${offers[j].user} , power remained to buy : ${demands[i].wantBuy}`
            );

            energyExchangeList.push({
              from: offers[j].user,
              to: demands[i].user,
              quantity: totalEnergyTransfer,
              price:
                totalEnergyTransfer *
                this.buildPrice(
                  parseInt(offers[j].price),
                  parseInt(demands[i].price),
                  totalEnergyTransfer,
                  totalEnergyTransfer
                ),
            });
          }
        }
      }
    }

    return energyExchangeList;
  }

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
    const response = this.smartMeterService.solarEnergyCurve();
    res.send(response);
  };

  /**
   *
   * @param offerPrice
   * @param demandPrice
   * @param energyBought
   * @param energyAvaiableFromProsumer
   */
  private buildPrice(
    offerPrice: number,
    demandPrice: number,
    energyBought: number,
    energyAvaiableFromProsumer: number
  ): number {
    const rateEnergyBuyed = (energyBought / energyAvaiableFromProsumer) * 100;

    const discount = this.calcDiscount(rateEnergyBuyed);

    const price = (offerPrice + demandPrice) / 2;
    const priceTotal = price - (price * discount) / 100;
    return priceTotal;
  }

  private calcDiscount(rateEnergyBuyed: number) {
    // Between 0 and 30 there isn't discount
    let discount = 0;
    if (rateEnergyBuyed > 30 && rateEnergyBuyed <= 60) {
      discount = 5;
    } else if (rateEnergyBuyed > 60 && rateEnergyBuyed <= 90) {
      discount = 10;
    } else if (rateEnergyBuyed > 90) {
      discount = 20;
    }

    return discount;
  }

  /**This method handled transaction in order to save information */
  private formatTransactions = (energyTransactionList: EnergyMatchingDto[]) => {
    let prosumer: Record<string, TransactionDto> = {};
    let consumer: Record<string, TransactionDto> = {};

    const transactionDate = new Date();

    energyTransactionList?.forEach((item) => {
      prosumer[item.from] = {
        quantity: item.quantity,
        date: transactionDate.toString(),
        price: (prosumer[item.from]?.price || 0) + item.price,
      };
      consumer[item.to] = {
        quantity: item.quantity,
        date: transactionDate.toString(),
        price: (consumer[item.to]?.price || 0) - item.price,
      };

      return {
        to: item.to,
      };
    });

    console.log("prosumer", prosumer);
    console.log("consumer", consumer);

    const pros = Object.entries(prosumer).map(([address, item]) => {
      return {
        address: address,
        ...item,
      };
    });

    const cons = Object.entries(consumer).map(([address, item]) => {
      return {
        address: address,
        ...item,
      };
    });

    const result = [...pros, ...cons];

    return result;
  };

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
}
