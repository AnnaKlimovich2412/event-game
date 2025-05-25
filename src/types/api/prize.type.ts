import { Raffle } from "./raffle.type";

export type Prize = {
  id?: string;
  name: string;
  image: string;
  raffle: Raffle["id"];
};

export type PrizeList = Prize[];
