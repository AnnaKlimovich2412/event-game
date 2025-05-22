import { useEffect, useState, type FC } from "react";

import logoUrl from "../../../assets/logo.svg";
import { getEvents, start } from "../../api/events";
import { Page } from "../../components/Page";
import Tile from "../../components/Tile";
import { CreateEventResponce } from "../../types/api";
import { retrieveLaunchParams } from "@telegram-apps/sdk";

export const IndexPage: FC = () => {
  const [events, setEvents] = useState<CreateEventResponce[]>([]);

  useEffect(() => {
    const { tgWebAppData } = retrieveLaunchParams();
    const user = tgWebAppData?.user;
    const id = user?.id;

    if (id) {
      start(id).then((data) => {
        console.log("Start data:", data);
        const token = data?.token;
        if (token) {
          localStorage.setItem("authToken", token);
        } else {
          console.error("Error starting app:", data);
        }
        getEvents().then(setEvents);
      });
    }
  }, []);

  return (
    <Page back={false}>
      <div
        role="banner"
        className="flex flex-col items-center justify-center px-[0] pb-[16px] mt-[60px]"
        // style={{ placeItems: "center", padding: "16px 0", margin: "0 auto" }}
      >
        <img src={logoUrl} alt="Be HUB Logo" style={{ height: "78px" }} />
      </div>

      <div className="flex flex-col items-center justify-center gap-[12px]">
        {events.map((event) => (
          <Tile key={event.id} event={event}></Tile>
        ))}
      </div>
    </Page>
  );
};
