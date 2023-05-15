import MatchingService from "./matching.service";

/**
 * This list define several time slot in order to run a simulation for each slot defined to
 * PV generation
 *
 */
const hours = [2, 4, 7, 11, 14, 17, 20, 23];

export default class SimulationService {
  private matchingService: MatchingService;

  constructor() {
    this.matchingService = new MatchingService();
  }
  public async runSimulation() {
    console.log("RUN SIMULATION AND RESULT");

    const dateList: Date[] = [];

    hours.forEach((hour) => {
      const date = new Date();
      date.setHours(hour);
      date.setMinutes(0);
      dateList.push(date);
    });

    let res: Record<string, any> = {};

    for (const date of dateList) {
      const transaction_result = await this.matchingService.matching(date);

      let totalProduced = transaction_result.smartMetersMisurations.reduce(
        (accumulator: number, item) => accumulator + item.produced,
        0
      );

      let totalConsumed = transaction_result.smartMetersMisurations.reduce(
        (accumulator: number, item) => accumulator + item.consumed,
        0
      );
      res[date.toLocaleString()] = {
        misuration: transaction_result.smartMetersMisurations,
        produced: totalProduced,
        consumed: totalConsumed,
        diff: totalProduced - totalConsumed,
        transaction: transaction_result.transactions,
      };
    }

    return res;
  }
}
