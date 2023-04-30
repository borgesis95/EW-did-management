import mongoose, { mongo } from "mongoose";
import { MarketDto, TransactionDto } from "../@types/express/interface";

var Offers = new mongoose.Schema({
  address: String,
  price: String,
  date: String,
});

const OfferModel = mongoose.model<MarketDto & mongoose.Document>(
  "Offers",
  Offers
);

export default OfferModel;
