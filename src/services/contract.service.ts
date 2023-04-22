import Provider from "@truffle/hdwallet-provider";
import Web3 from "web3";
import mcSmart from "../../blockchain/build/contracts/MarketMicroGridContract.json";
import { EnergyMatchingDto } from "../@types/express/interface";
export default class ContractService {
  private provider;
  private web3;
  private microGridSmartContract;
  private smartContractAddress = "0x36d6118d7943E4a66eB29D51558F8003b5DeEf2c";

  constructor() {
    const privateKey = process.env.PRIVATE_KEY || "";
    const rpc = process.env.RPC_URL || "";
    this.provider = new Provider([privateKey], rpc);

    //@ts-ignore
    this.web3 = new Web3(this.provider);
    this.microGridSmartContract = new this.web3.eth.Contract(
      //@ts-ignore
      mcSmart.abi,
      //@ts-ignore
      this.smartContractAddress
    );
  }

  public getAllOffers = async () => {
    const values = await this.microGridSmartContract.methods.getOffers().call();
    return values;
  };

  public getBids = async () => {
    const values = await this.microGridSmartContract.methods.getBids().call();
    return values;
  };

  public getMatch = async () => {
    const values = await this.microGridSmartContract.methods.getMatch().call();
    return values;
  };

  public addMatching = async (matching: EnergyMatchingDto[]) => {
    console.log("ADD");
    const accounts = await this.web3.eth.getAccounts();
    console.log("account:", accounts);
    try {
      await this.microGridSmartContract.methods
        .createMatch(matching)
        .send({ from: accounts[0] });
    } catch (error) {
      console.error(error);
    }
  };
}
