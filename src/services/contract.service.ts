import Provider from "@truffle/hdwallet-provider";
import Web3 from "web3";
import mcSmart from "../../blockchain/build/contracts/MarketMicroGridContract.json";
import { EnergyMatchingDto } from "../@types/express/interface";
export default class ContractService {
  private provider;
  private web3;
  private microGridSmartContract;
  private smartContractAddress = "0xeFfa502E18A0Cfe90EE247c5FbF65D8A678c0fa4";

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

  public getBalance = async () => {
    const values = await this.microGridSmartContract.methods
      .getContractBalance()
      .call();

    const eurValue =
      parseFloat(this.web3.utils.fromWei(values, "ether")) / 0.00058;
    return { eurValue, weiValue: values };
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
      const response = await this.microGridSmartContract.methods
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

  public createOffer = async (account: string, price: number) => {
    try {
      const accounts = await this.web3.eth.getAccounts();
      await this.microGridSmartContract.methods
        .createOffer(account, price, Date.now())
        .send({ from: accounts[0] });
    } catch (error) {
      console.error(error);
    }
  };

  public createBids = async (account: string, price: number) => {
    try {
      const accounts = await this.web3.eth.getAccounts();
      await this.microGridSmartContract.methods
        .createBid(account, price, Date.now())
        .send({ from: accounts[0] });
    } catch (error) {
      console.error(error);
    }
  };
}
