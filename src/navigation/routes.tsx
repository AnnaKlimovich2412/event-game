import type { ComponentType, JSX } from "react";
import EventPage from "../pages/EventPage/EventPage";
import GamePage from "../pages/GamePage";
import { IndexPage } from "../pages/IndexPage/IndexPage";
import { PrizesPage } from "../pages/PrizesPage/PrizesPage";

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: "/", Component: IndexPage },
  { path: "/event/:id", Component: EventPage, title: "Event Details" },
  { path: "/event/:id/prizes", Component: PrizesPage, title: "Prizes" },
  { path: "/event/:id/game/:raffleId", Component: GamePage, title: "Game" },
];
