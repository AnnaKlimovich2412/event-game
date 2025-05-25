import { EventResponce } from "./game";
import { PrizeList } from "./prize.type";

export type Raffle = {
  id: string;
  name: string;
  terms: string;
  startTime: string;
  endTime: string;
  event: EventResponce["id"];
  prizes: PrizeList;
  fields: any[];
  subscriptions: any[];
  status: number;
  duration: string;
  startedAt: string | null;
  startedAtTimeStamp: number | null;
  openAt: string | null;
  openAtTimeStamp: number | null;
  openUntilAt: string | null;
  openUntilAtTimeStamp: number | null;
};

export type RaffleList = Raffle[];
