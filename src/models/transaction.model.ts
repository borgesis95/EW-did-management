import mongoose, { mongo } from "mongoose";
import { TransactionDto } from "../@types/express/interface";

var transactionSchema = new mongoose.Schema({
  address: String,
  quantity: String,
  price: Number,
  date: String,
});

const transactionModel = mongoose.model<TransactionDto & mongoose.Document>(
  "Transactions",
  transactionSchema
);

export default transactionModel;
