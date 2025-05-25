import { useEffect, useState, type FC } from "react";
import { Page } from "../../components/Page";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { EventResponce } from "../../types/api";
import { DateTime } from "luxon";
import { imageRetrieve } from "../../api/events";
import { useEventPolling } from "../../hooks/useEventPolling";
import { useEvent } from "../../context/Event.context";

export const PrizesPage: FC = () => {
  const location = useLocation();
  const locationEvent = location.state?.event as EventResponce | undefined;
  const { event: contextEvent, raffle } = useEvent();
  const [imageError, setImageError] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEventPolling();
  const event = contextEvent || locationEvent;

  if (!event) {
    return (
      <Page>
        <div className="p-[16px] min-h-screen text-white">
          Информация о событии не найдена.
        </div>
      </Page>
    );
  }

  useEffect(() => {
    const name = event.raffles[0]?.prizes[0]?.image;
    if (!name) {
      setImageError(true);
      return;
    }
    imageRetrieve("prize", name)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      })
      .catch(() => {
        setImageError(true);
      });
  }, []);

  const handleParticipateClick = () => {
    if (event && id && raffle?.id) {
      navigate(`/event/${id}/game/${raffle.id}`, { state: { event: event } });
    }
  };

  const eventDateStr = DateTime.fromSQL(event.date).toFormat("dd.MM.yyyy");
  const eventTimeStr = DateTime.fromSQL(event.startTime, { zone: "utc" })
    .setZone("Europe/Moscow")
    .toFormat("HH:mm");

  return (
    <Page back={true}>
      <div className="p-[16px] min-h-screen">
        <div className="h-[90px] w-[100%]"></div>
        <div className="flex flex-col gap-[8px]">
          <div className="flex flex-col gap-[4px] pt-[20px] px-[4px] pb-[12px]">
            <span className="text-h1 text-[white]">{event.name}: розыгрыш</span>
            <span className="text-h5 text-[white]">
              {eventDateStr}, {eventTimeStr} MSK
            </span>
          </div>

          <div className="bg-[#202223] rounded-[12px] px-[16px] py-[12px] text-h3 text-[white]">
            {event.description}
          </div>
        </div>
        <div className="flex flex-col gap-[12px] mt-[28px]">
          {raffle?.prizes.map((prize) => (
            <div
              key={prize.id}
              className="bg-[#202223] rounded-[12px] flex gap-[12px]"
            >
              <div className="relative min-h-[90px] max-h-[90px] w-[90px] overflow-hidden rounded-[12px]">
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
              <div className="flex flex-col gap-[8px] py-[22px]">
                <span className="text-h3-bold text-[white]">{prize.name}</span>
                <span className="text-h5">
                  Участников: {raffle.subscriptions?.length}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-[50px] left-[16px] right-[16px]">
          <button
            className="button-yellow h-[60px] text-h2 w-full"
            onClick={() => {
              handleParticipateClick();
            }}
          >
            Участвовать
          </button>
        </div>
      </div>
    </Page>
  );
};
