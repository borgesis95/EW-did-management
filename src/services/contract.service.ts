import Provider from "@truffle/hdwallet-provider";
import Web3 from "web3";
import mcSmart from "../../blockchain/build/contracts/MarketMicroGridContract.json";
import { EnergyMatchingDto } from "../@types/express/interface";
export default class ContractService {
  private provider;
  private web3;
  private microGridSmartContract;
  private smartContractAddress = "0x9C2a983454F69fD9d50c4e1f2DEf43cAD0D60B6c";

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

  public getTransactionMoneyByAddress = async (address: string) => {
    const values = await this.microGridSmartContract.methods
      .getPaymentTransaction(address)
      .call();
    return values;
  };

  public addTransactionPayment = async (address: string, price: number) => {
    const accounts = await this.web3.eth.getAccounts();
    try {
      await this.microGridSmartContract.methods
        .createPaymentTransaction(address, price)
        .send({ from: accounts[0] });
    } catch (error) {
      console.error(error);
    }
  };

  public addMatching = async (matching: EnergyMatchingDto[]) => {
    const accounts = await this.web3.eth.getAccounts();
    try {
      await this.microGridSmartContract.methods
        .createMatch(matching)
        .send({ from: accounts[0] });
    } catch (error) {
      console.error(error);
    }
  };
}
