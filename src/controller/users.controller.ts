import * as express from "express";
import userModel from "../models/user.model";
import crypto from "crypto";
import { recoverPersonalSignature } from "@metamask/eth-sig-util";

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
      nonce = crypto.randomBytes(16).toString("base64");
      await this.user.create({
        address: accountAddress,
        nonce: nonce,
      });
    } else {
      nonce = user.nonce;
    }

    response.send({
      nonce: nonce,
    });
  };

  private authenticate = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const body = request.body;

    const user = await this.user.findOne({
      address: body.address,
    });

    if (user) {
      const msg = `nonce_${user.nonce}`;
      const msgBufferHex = bufferToHex(Buffer.from(msg, "utf8"));
      const address = recoverPersonalSignature({
        data: msgBufferHex,
        signature: body.msg,
      });

      // TODO: Inserire controlli sull utente
    }
    response.send("risposta");
  };
}
