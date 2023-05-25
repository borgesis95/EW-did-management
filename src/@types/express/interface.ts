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

export interface MarketDto {
  address?: string;
  price: number;
  date: string;
}

export interface ProsumerOffer {
  /** Define user which created offer  */
  user: string;
  /* Describe how much energy can sell to other consumers */
  canSell: number;
  price: string;
}

export interface ConsumerBid {
  user: string;
  wantBuy: number;
  price: string;
}
