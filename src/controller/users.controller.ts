import * as express from "express";
import userModel, { User } from "../models/user.model";
import crypto from "crypto";
import { recoverPersonalSignature } from "@metamask/eth-sig-util";
import HttpException from "../exceptions/HttpException";
import APIresponse from "../response/response";
import { createToken } from "../utils/jwt";
import { energyModel } from "../models/energy.model";
import { format } from "date-fns";
import { auth } from "../middleware/auth";

export default class UserController {
  public path = "/user";
  public router = express.Router();

  private user = userModel;
  private energy = energyModel;

  constructor() {
    this.defineRoutes();
  }

  private defineRoutes() {
    this.router.get(`${this.path}/:address`, this.checkUser);
    this.router.post(`${this.path}/auth`, this.authenticate);
    this.router.post(`${this.path}/create/:address`, this.createUser);
    this.router.get(
      `${this.path}/energy/list`,
      auth,
      this.retrieveEnergiesData
    );
    this.router.get(
      `${this.path}/energy/all`,
      auth,
      this.retrieveTotalEnergyData
    );
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

    console.log("USER", user);

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
        //@ts-ignore
        token = createToken(address, user.username);
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

  private retrieveEnergiesData = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const address = response.locals.user;

    const res = await energyModel.find({
      user_id: address,
    });

    const mapRes = res.map((item) => {
      return {
        produced: item.produced,
        consumed: item.consumed,
        date: format(new Date(item.date), "dd/LL/yyyy HH:mm"),
      };
    });
    response.send(APIresponse.success(mapRes));
  };

  private retrieveTotalEnergyData = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const address = response.locals.user;
    const res = await energyModel.aggregate([
      {
        $match: {
          user_id: address,
        },
      },
      {
        $group: {
          _id: "$user_id",
          totally_produced: {
            $sum: "$produced",
          },
          totally_consumed: {
            $sum: "$consumed",
          },
        },
      },
    ]);

    const result = [
      {
        name: "Produced (KW)",
        value: res[0]?.totally_produced,
      },
      {
        name: "Consumed (KW)",
        value: res[0]?.totally_consumed,
      },
    ];

    response.send(APIresponse.success(result));
  };
}
