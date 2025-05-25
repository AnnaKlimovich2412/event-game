import { Button, Section } from "@telegram-apps/telegram-ui";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EventResponce } from "../types/api";
import { DateTime } from "luxon";
import { imageRetrieve } from "../api/events";

interface TileProps {
  event: EventResponce;
}

const Tile: React.FC<TileProps> = ({ event }) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageError, setImageError] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const name = event.image;
    imageRetrieve("event", name)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      })
      .catch((err) => {
        setImageError(true);
      });
  }, []);

  return (
    <Section
      key={event.id}
      style={{
        width: "-webkit-fill-available",
        margin: "0 16px",
        borderRadius: "24px",
        overflow: "hidden",
      }}
    >
      <div className="relative min-h-[156px] max-h-[156px] overflow-hidden">
        {!imageError && imageUrl && (
          <img
            src={imageUrl || ""}
            alt={event.name}
            className="absolute inset-[0] w-full object-cover"
          />
        )}
        {(!imageUrl || imageError) && (
          <div className="absolute inset-[0] bg-[#707579]"></div>
        )}
      </div>

      <div className="pt-[16px] px-[20px] pb-[20px] flex flex-col bg-[#202223] items-start justify-center">
        <div className="flex flex-col">
          <span className="text-h3-bold text-[white]">{event.name}</span>
          <div>
            <span className="text-h4">
              {DateTime.fromSQL(event.date).toFormat("dd.MM.yyyy")},{" "}
              {DateTime.fromSQL(event.startTime, { zone: "utc" })
                .setZone("Europe/Moscow")
                .toFormat("HH:mm") + " MSK"}
            </span>
          </div>
          <span className="text-h5">{event.description}</span>
        </div>

        <Button
          className="button-yellow h-[44px] min-w-[120px] text-h4-bold mt-[12px]"
          onClick={() => {
            localStorage.setItem("currentEventId", event.id.toString());
            navigate(`/event/${event.id}`);
          }}
        >
          Участвовать
        </Button>
      </div>
    </Section>
  );
};

export default Tile;
