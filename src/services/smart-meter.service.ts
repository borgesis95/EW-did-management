import schedule from "node-schedule";
import userModel from "../models/user.model";
import { EnergyData, energyModel } from "../models/energy.model";
import {
  LOWER_BOUND_ENERGY,
  UPPER_BOUND_ENERGY,
  solarCurveValues,
} from "../utils/meters-hour";

export default class SmartMeterService {
  private scheduleTime: string;
  private energyModel = energyModel;
  private user = userModel;

  constructor(scheduleTime: string) {
    this.scheduleTime = scheduleTime;
  }

  public run() {
    schedule.scheduleJob(this.scheduleTime, () => {
      this.retrieveUsersAndPush();
    });
  }

  /**For each user create new istance of simulated smart meter and push into DBb*/
  public retrieveUsersAndPush = async (isTest = false) => {
    const users = await this.user.find();
    const reading_date = new Date();

    const result: EnergyData[] = [];

    users.map((user) => {
      const res = this.generateValues();

      const value: EnergyData = {
        user_id: user.address,
        consumed: res.consumed,
        produced: res.produced,
        diff: res.produced - res.consumed,
        date: reading_date,
      };
      result.push(value);
    });

    isTest == false ? await this.energyModel.insertMany(result) : null;
    return result;
  };

  /**
   * Goal of this function is create an accurate simulation of energy produced according the day's hour
   */
  public solarEnergyCurve = () => {
    const hour = new Date().getHours();
    let min = 0;
    let max = 0;
    solarCurveValues.every((item) => {
      if (hour >= item.from && hour < item.to) {
        min = item.min;
        max = item.max;
        return false;
      }

      return true;
    });

    return { min, max };
  };

  private generateValues = () => {
    const { min, max } = this.solarEnergyCurve();
    const produced = this.generateRandomInteger(min, max);
    const consumed = this.generateRandomInteger(LOWER_BOUND_ENERGY, 180);

    return {
      produced,
      consumed,
    };
  };

  private generateRandomInteger = (min: number, max: number) => {
    return Math.floor(min + Math.random() * (max - min + 1));
  };
}
