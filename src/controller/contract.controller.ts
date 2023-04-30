import * as express from "express";
import ContractService from "../services/contract.service";

const OFFERS = [
  {
    account: "0x5afb414af5189C8290E5E4F0F7d4A47d9F6f5e8b",
    price: 15,
  },
  {
    account: "0xB355D6fCF8F2fe13c47E69B015E78cd637eE64C5",
    price: 25,
  },

  {
    account: "0xa45eEfC39deE659c85C5D640F85db344fACC3d6f",
    price: 12,
  },
  {
    account: "0x17d9c6D7834c35CedE6F63bD05A69E331cdDc77d",
    price: 9,
  },
  {
    account: "0x8D18c885db1138bC80A3f5E6343510bc93fB41A8",
    price: 11,
  },
];

const DEMANDS = [
  {
    account: "0x5afb414af5189C8290E5E4F0F7d4A47d9F6f5e8b",
    price: 21,
  },
  {
    account: "0xB355D6fCF8F2fe13c47E69B015E78cd637eE64C5",
    price: 27,
  },
  {
    account: "0xa45eEfC39deE659c85C5D640F85db344fACC3d6f",
    price: 19,
  },
  {
    account: "0x17d9c6D7834c35CedE6F63bD05A69E331cdDc77d",
    price: 18,
  },
  {
    account: "0x8D18c885db1138bC80A3f5E6343510bc93fB41A8",
    price: 45,
  },
];

export default class ContractController {
  public path = "/contract";
  public router = express.Router();
  public contractService = new ContractService();

  constructor() {
    this.defineRoutes();
    // this.contractService = new ContractService();
  }

  private defineRoutes() {
    this.router.get(`${this.path}/all`, this.contractCreationScript);
    this.router.get(`${this.path}/balance`, this.getBalance);
  }

  private contractCreationScript(
    request: express.Request,
    response: express.Response
  ) {
    const contract = new ContractService();

    OFFERS.map(async (it) => {
      await contract.createOffer(it.account.toLowerCase(), it.price);
    });

    DEMANDS.map(async (it) => {
      await contract.createBids(it.account.toLowerCase(), it.price);
    });

    response.send("Script create");
  }

  private getBalance = async (
    request: express.Request,
    response: express.Response
  ) => {
    const contract = new ContractService();
    const result = await contract.getBalance();

    response.send({
      wei: result.weiValue,
      eur: result.eurValue,
    });
  };
}
