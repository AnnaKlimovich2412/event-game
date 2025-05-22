import { EventFormData, Raffle, SubEvent } from ".";

export type CreateEventResponce = {
  id: number;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  shortDescription: string;
  description: string;
  address: string;
  subEvents: SubEvent[];
  raffles: Raffle[];
  raffleStatus: "started" | "waiting" | "end";
  showStatus: EventFormData["showStatus"];
  image: string;
  subscriptions: string[];
};
