import mongoose from "mongoose";

export interface EnergyData {
  user_id: string;
  produced: number;
  consumed: number;
  diff: number;
  date: Date;
}

const energySchema = new mongoose.Schema({
  user_id: String,
  produced: Number,
  consumed: Number,
  diff: Number,
  date: String,
});

export const energyModel = mongoose.model<EnergyData & mongoose.Document>(
  "Energies",
  energySchema
);
