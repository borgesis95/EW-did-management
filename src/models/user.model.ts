import * as mongoose from "mongoose";

export enum SourceEnergyEnum {
  Solar = 1,
  Wind = 2,
  Battery = 3,
}
export interface Assets {
  nickname: string;
  source: SourceEnergyEnum;
  kw: number;
  date: string;
  chargePercentage: number;
}

export interface User {
  address: string;
  nonce: string;
  email: string;
  assets: Assets[];
}

var assetsSchema = new mongoose.Schema({
  nickname: String,
  source: String,
  kw: Number,
  date: String,
  chargePercentage: Number,
});

const userSchema = new mongoose.Schema({
  address: String,
  nonce: String,
  username: String,
  email: String,
  assets: [assetsSchema],
});

const userModel = mongoose.model<User & mongoose.Document>("User", userSchema);

export default userModel;
