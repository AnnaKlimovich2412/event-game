import { SubEventList } from "./subEvent.type";
import { RaffleList } from "./raffle.type";
import { DateTime } from "luxon";

export type EventFormData = {
  id?: string;
  name: string;
  eventDate: DateTime | null;
  eventStartTime: string;
  eventEndTime: string;
  shortDescription: string;
  description: string;
  address: string;
  image: File | string | null;
  subEvents: SubEventList;
  raffles: RaffleList;
  showStatus: "past" | "today" | "next" | "pending" | undefined;
};

export type EventList = EventFormData[];
