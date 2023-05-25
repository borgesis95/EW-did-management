import MatchingService from "./matching.service";

/**
 * This list define several time slot in order to run a simulation for each slot defined to
 * PV generation
 *
 */
const hours = [2, 4, 7, 11, 14, 17, 20, 23];

// const hours = [17, 20, 23];

export default class SimulationService {
  private matchingService: MatchingService;

  constructor() {
    this.matchingService = new MatchingService();
  }
  public async runSimulation() {
    const dateList: Date[] = [];

    const quantitaDaVendereTotale = [];
    const quantitaVendutaTotale = [];

    const general: Record<string, any> = {};
    let response = [];
    for (let i = 0; i < 2; i++) {
      hours.forEach((hour) => {
        const date = new Date();
        date.setHours(hour);
        date.setMinutes(0);
        date.setSeconds(0);
        dateList.push(date);
      });

      let res: Record<string, any> = {};

      for (const date of dateList) {
        const transaction_result = await this.matchingService.matching(date);

        // Racchiude la produzione di energia
        const quantitaDaVendere = transaction_result.smartMetersMisurations
          .filter((item) => item.diff > 0)
          .reduce((acc: number, item) => acc + item.diff, 0);

        let quantitaVenduta = transaction_result.energyExchangeList.reduce(
          (acc: number, item) => acc + item.quantity,
          0
        );

        quantitaDaVendereTotale.push(quantitaDaVendere);
        quantitaVendutaTotale.push(quantitaVenduta);

        res[date.toLocaleString()] = {
          // misuration: transaction_result.smartMetersMisurations,
          // transaction: transaction_result.transactions,
          numeroTransazioni: transaction_result.transactions.length,
          quantitaVenduta: quantitaVenduta,
          quantitaDaVendere: quantitaDaVendere,
          offerte: transaction_result.offersByLowestPrice,
          percentualeEnergiaVenduta:
            (quantitaVenduta / quantitaDaVendere) * 100,
        };
      }

      res.quantitaVendutaTotale = quantitaVendutaTotale.reduce(
        (acc: number, item) => acc + item,
        0
      );
      res.quantitaDaVendereTotale = quantitaDaVendereTotale.reduce(
        (acc: number, item) => acc + item,
        0
      );

      response.push(res);
    }

    return response;
  }
}
