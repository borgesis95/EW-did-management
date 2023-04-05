import * as express from "express";
import userModel, { User } from "../models/user.model";
import crypto from "crypto";
import { recoverPersonalSignature } from "@metamask/eth-sig-util";
import HttpException from "../exceptions/HttpException";
import APIresponse from "../response/response";
import { createToken } from "../utils/jwt";

export default class UserController {
  public path = "/user";
  public router = express.Router();

  private user = userModel;

  constructor() {
    this.defineRoutes();
  }

  private defineRoutes() {
    this.router.get(`${this.path}/:address`, this.checkUser);
    this.router.post(`${this.path}/auth`, this.authenticate);
    this.router.post(`${this.path}/create/:address`, this.createUser);
  }

  private checkUser = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    let nonce;
    const accountAddress = request.params.address;
    const user = await this.user.findOne({
      address: accountAddress,
    });

    /**This means that user is not available on database and need to be created */
    if (!user) {
      next(new HttpException(400, "User not found"));
    } else {
      nonce = user.nonce;
      response.send({
        nonce: nonce,
      });
    }
  };

  private authenticate = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const body = request.body;
    let token = "";
    const user = await this.user.findOne({
      address: body.address,
    });

    // If user is already available then check if address is correct
    if (user) {
      const msg = `nonce_${user.nonce}`;
      // const msgBufferHex = bufferToHex(Buffer.from(msg, "utf8"));
      const address = recoverPersonalSignature({
        data: msg,
        signature: body.msg,
      });

      if (address == body.address) {
        token = createToken(address);
      }
    }

    response.send(APIresponse.success(token));
  };

  private createUser = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const public_address = request.params.address;

    const user_request: User = request.body;

    if (public_address) {
      const nonce = crypto.randomBytes(16).toString("base64");
      user_request.nonce = nonce;
      user_request.address = public_address;
      await this.user.create(user_request);

      response.send(APIresponse.success("User has been created"));
    }
  };
}
