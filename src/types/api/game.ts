import { EventFormData, Raffle, SubEvent } from ".";

export type EventResponce = {
  address: string;
  date: string;
  description: string;
  duration: string;
  endTime: string;
  id: number;
  image: string;
  name: string;
  raffleId: string;
  raffleStatus: "started" | "waiting" | "end";
  raffles: Raffle[];
  shortDescription: string;
  showStatus: EventFormData["showStatus"];
  startTime: string;
  status: number;
  subEvents: SubEvent[];
  subscriptions: string[];
};
