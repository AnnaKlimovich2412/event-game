import type { ComponentType, JSX } from "react";
import { IndexPage } from "../pages/IndexPage/IndexPage";
import { InitDataPage } from "../pages/InitDataPage";
import { ThemeParamsPage } from "../pages/ThemeParamsPage";
import { LaunchParamsPage } from "../pages/LaunchParamsPage";
import { PrizesPage } from "../pages/PrizesPage/PrizesPage";
import EventPage from "../pages/EventPage/EventPage";
import GamePage from "../pages/GamePage";

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: "/", Component: IndexPage },
  { path: "/init-data", Component: InitDataPage, title: "Init Data" },
  { path: "/theme-params", Component: ThemeParamsPage, title: "Theme Params" },
  {
    path: "/launch-params",
    Component: LaunchParamsPage,
    title: "Launch Params",
  },
  { path: "/event/:id", Component: EventPage, title: "Event Details" },
  { path: "/event/:id/prizes", Component: PrizesPage, title: "Prizes" },
  { path: "/event/:id/game/:raffleId", Component: GamePage, title: "Game" },
];
