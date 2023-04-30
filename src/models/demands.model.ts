import mongoose, { mongo } from "mongoose";
import { MarketDto, TransactionDto } from "../@types/express/interface";

var demands = new mongoose.Schema({
  address: String,
  price: String,
  date: String,
});

const DemandsModel = mongoose.model<MarketDto & mongoose.Document>(
  "demands",
  demands
);

export default DemandsModel;
