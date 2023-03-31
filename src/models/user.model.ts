import * as mongoose from "mongoose";

export interface User {
  adddress: string;
  nonce: string;
}
const userSchema = new mongoose.Schema({
  address: String,
  nonce: String,
});

const userModel = mongoose.model<User & mongoose.Document>("User", userSchema);

export default userModel;
