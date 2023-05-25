import DemandsModel from "../models/demands.model";
import OfferModel from "../models/offers.model";
import AssetsService from "./assets.service";
import ContractService from "./contract.service";
import SmartMeterService from "./smart-meter.service";
import transactionModel from "../models/transaction.model";
import {
  ConsumerBid,
  EnergyMatchingDto,
  ProsumerOffer,
  TransactionDto,
} from "../@types/express/interface";
import { EnergyData } from "../models/energy.model";

export default class MatchingService {
  public smartMeterService: SmartMeterService;
  public contractService: ContractService;
  public assetService: AssetsService;
  private transactionModel = transactionModel;
  private offerModel = OfferModel;
  private demandsModel = DemandsModel;

  constructor() {
    this.smartMeterService = new SmartMeterService("");
    this.contractService = new ContractService();
    this.assetService = new AssetsService();
  }

  public matching = async (date?: Date) => {
    try {
      const smartMetersMisurations =
        await this.smartMeterService.retrieveUsersAndCreateSimulatedValues(
          true,
          date
        );

      const offersList = await this.contractService.getAllOffers();
      const bidsList = await this.contractService.getBids();

      const prosumerCanSellEnergyList =
        this.filterProsumersThatCanSellEnergyAndHasOffers(
          smartMetersMisurations,
          offersList
        );

      const consumersWantEnergyList = this.filterConsumersWantBuyEnergyFromP2p(
        smartMetersMisurations,
        bidsList
      );

      const { offersByLowestPrice, energyExchangeList } = this.clearMarket(
        consumersWantEnergyList,
        prosumerCanSellEnergyList
      );

      const transactions = this.formatTransactions(energyExchangeList);
      /**Add response to mongodb in order to get information to user about  what happen*/
      await transactionModel.insertMany(transactions);
      /**Save transaction on BC */
      transactions.forEach(async (it) => {
        await this.contractService.addTransactionPayment(
          it.address,
          parseInt(it.price.toFixed(2))
        );
      });

      return {
        smartMetersMisurations,
        transactions,
        energyExchangeList,
        offersByLowestPrice,
      };
    } catch (error) {
      console.error(error);
      throw new Error("something went wrong");
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
          canSellInitial: prosumerWithOfferCreated.diff,
          price: item.minPrice,
        } as ProsumerOffer;
      }
    }) as ProsumerOffer[];

    return prosumersOffers.filter((prosOffers) => prosOffers !== undefined);
  };

  /**
   * Method that will be used to matching demands and response
   */
  private clearMarket(demands: ConsumerBid[], offers: ProsumerOffer[]) {
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
      for (let j = 0; j < offersByLowestPrice.length; j++) {
        if (
          demands[i].wantBuy !== 0 &&
          offers[j].canSell !== 0 &&
          parseInt(offers[j].price) <= parseInt(demands[i].price)
        ) {
          if (offers[j].canSell >= demands[i].wantBuy) {
            const totalEnergyRemain = offers[j].canSell;
            const totalEnergyTransfer = demands[i].wantBuy;
            const powerRemained = offers[j].canSell - totalEnergyTransfer;

            demands[i].wantBuy = totalEnergyTransfer - demands[i].wantBuy;
            offers[j].canSell = powerRemained;

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

    return { energyExchangeList, offersByLowestPrice };
  }

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
      discount = 2;
    } else if (rateEnergyBuyed > 60 && rateEnergyBuyed <= 90) {
      discount = 4;
    } else if (rateEnergyBuyed > 90) {
      discount = 6;
    }

    return discount;
  }

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

  private loadBattery = () => {
    //   //TODO: Da implementare
    //   smartMetersMisurations.forEach((misuration) => {
    //     misuration.diff > 0 &&
    //       this.assetService.loadBattery(misuration.user_id, misuration.diff);
    //   });
  };
}
