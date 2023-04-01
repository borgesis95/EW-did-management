import * as mongoose from "mongoose";

export interface User {
  address: string;
  nonce: string;
  email: string;
}
const userSchema = new mongoose.Schema({
  address: String,
  nonce: String,
  username: String,
  email: String,
});

const userModel = mongoose.model<User & mongoose.Document>("User", userSchema);

export default userModel;

/** Request */
