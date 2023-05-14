import { start } from "repl";
import userModel, { SourceEnergyEnum } from "../models/user.model";

export default class AssetsService {
  private user = userModel;

  /**
   * This method check if user has a BESS in order
   * to load battery before selling energy to other customers
   * @param account
   * @param load
   */
  public loadBattery = async (account: string, load: number) => {
    const user = await userModel.findOne({ address: account });

    let startLoad = load;

    if (user && user.assets.length > 0) {
      console.log("user", user.address);
      console.log("carica iniziale:", load, "\n");

      const assets =
        user &&
        user?.assets?.length > 0 &&
        user?.assets.map((asset) => {
          if (asset.source == SourceEnergyEnum.Battery) {
            console.log("valore di carica", startLoad);
            console.log("disponibilità batteria", asset.kw);

            // Più energia di quanto possa metterne nella batteria
            const val = asset.kw - (asset.chargePercentage || 0);
            let percent = 0;

            console.log("quanto posso inserire?", val);
            // 22 > 64
            if (val > startLoad) {
              console.log("primo if");
              percent = startLoad;
            } else {
              console.log("secondo if");

              percent = val;
            }

            console.log("inserisco nella batteria..", percent);
            startLoad = startLoad - percent;
          }
        });
    }
  };
}
