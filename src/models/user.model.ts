import * as mongoose from "mongoose";

export enum SourceEnergyEnum {
  Solar = 1,
  Wind = 2,
}
export interface Assets {
  DID: string;
  nickname: string;
  source: string;
}
export interface User {
  address: string;
  nonce: string;
  email: string;
  assets: Assets[];
}

var assetsSchema = new mongoose.Schema({
  did: String,
  nickname: String,
  source: String,
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

/** Request */
