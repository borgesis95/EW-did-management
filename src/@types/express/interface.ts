export interface EnergyMatchingDto {
  from: string;
  to: string;
  price: number;
  quantity: number;
}

export interface TransactionDto {
  address?: string;
  quantity: number;
  price: number;
  date: string;
}
