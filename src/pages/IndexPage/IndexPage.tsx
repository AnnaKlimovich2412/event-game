import { useEffect, useState, type FC } from "react";

import logoUrl from "../../../assets/logo.svg";
import { getEvents, start } from "../../api/events";
import { Page } from "../../components/Page";
import Tile from "../../components/Tile";
import { EventResponce } from "../../types/api";
import { retrieveLaunchParams } from "@telegram-apps/sdk";
import { useEvent } from "../../context/Event.context";

export const IndexPage: FC = () => {
  const [events, setEvents] = useState<EventResponce[]>([]);
  const { event } = useEvent();

  useEffect(() => {
    const { tgWebAppData } = retrieveLaunchParams();
    const user = tgWebAppData?.user;
    const id = user?.id;
    let eventsPollingInterval: NodeJS.Timeout | null = null;

    if (id) {
      // TODO remove hardcode
      start(id !== 1 ? id : 935078579).then((data) => {
        console.log("Start data:", data);
        const token = data?.token;
        if (token) {
          localStorage.setItem("authToken", token);
        } else {
          console.error("Error starting app:", data);
        }

        getEvents().then(setEvents);

        eventsPollingInterval = setInterval(() => {
          getEvents()
            .then(setEvents)
            .catch((error) => {
              console.error("Error polling events:", error);
            });
        }, 10000);
      });
    }

    return () => {
      if (eventsPollingInterval) {
        clearInterval(eventsPollingInterval);
      }
    };
  }, []);

  return (
    <Page back={false}>
      <div
        role="banner"
        className="flex flex-col items-center justify-center px-[0] pb-[16px] mt-[60px]"
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
