import schedule from "node-schedule";
import userModel from "../models/user.model";
import { EnergyData, energyModel } from "../models/energy.model";

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
  public retrieveUsersAndPush = async () => {
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

    await this.energyModel.insertMany(result);
    return result;
  };

  private generateValues = () => {
    const produced = this.generateRandomInteger(0, 100);
    const consumed = this.generateRandomInteger(0, 100);

    return {
      produced,
      consumed,
    };
  };

  private generateRandomInteger = (min: number, max: number) => {
    return Math.floor(min + Math.random() * (max - min + 1));
  };
}
