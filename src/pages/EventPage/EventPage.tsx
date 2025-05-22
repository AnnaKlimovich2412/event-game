import type { FC } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Page } from "../../components/Page";
import { useEffect, useMemo, useState } from "react";
import { getEventById } from "../../api/events";
import type { CreateEventResponce } from "../../types/api";
import { DateTime } from "luxon";

const EventPage: FC = () => {
  const [event, setEvent] = useState<CreateEventResponce | null>(null);
  const [raffleStatus, setraffleStatus] = useState<string | null>(null);
  const [firstTime, setFirstTime] = useState<DateTime | null>(null);
  const [finishTime, setFinishTime] = useState<DateTime | null>(null);
  const [timeNow, setTimeNow] = useState<DateTime | null>(DateTime.now());
  const [progress, setProgress] = useState("0");

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const eventId = Number(id);
      getEventById(eventId)
        .then((data) => {
          setraffleStatus(data.raffleStatus);
          setEvent(data);
        })
        .catch(console.error);
    }
  }, [id]);

  useEffect(() => {
    if (!firstTime || !finishTime) return;
    const firstEventTime = firstTime.toMillis();
    const lastEventTime = finishTime.toMillis();
    const now = DateTime.now().toMillis();
    if (firstEventTime > now) {
      setProgress("0");
      return;
    }
    if (lastEventTime < now) {
      setProgress("1");
      return;
    }

    const totalDayDuration = lastEventTime - firstEventTime;
    const elapsedTime = now - firstEventTime;

    const dayProgress = (elapsedTime / totalDayDuration).toFixed(2);

    setProgress(dayProgress.toString());
  }, [firstTime, finishTime]);

  const program = useMemo(() => {
    if (!event) return [];
    const { year, month, day } = DateTime.now();
    const items = [
      ...event.subEvents.map((se) => ({
        time: se.startTime,
        timeToCalculate: DateTime.fromSQL(se.startTime)
          .set({ year, month, day })
          .toMillis(),
        labelTime: `${DateTime.fromSQL(se.startTime)
          .set({ year, month, day })
          .toFormat("HH:mm")} - ${DateTime.fromSQL(se.endTime).toFormat(
          "HH:mm"
        )}`,
        title: se.name,
        type: "event" as const,
      })),
      ...event.raffles.map((r) => ({
        time: r.startTime,
        timeToCalculate: DateTime.fromSQL(r.startTime)
          .set({ year, month, day })
          .toMillis(),
        labelTime: DateTime.fromSQL(r.startTime).toFormat("HH:mm"),
        title: r.name,
        type: "action" as const,
        actionText: "Участвовать",
      })),
    ]
      .sort((a, b) => {
        const aTime = DateTime.fromSQL(a.time, { zone: "utc" });
        const bTime = DateTime.fromSQL(b.time, { zone: "utc" });
        return aTime.toMillis() - bTime.toMillis();
      })
      .map((item, i, arr) => {
        const startTime = DateTime.fromSQL(arr[0].time, { zone: "utc" });
        const endTime = DateTime.fromSQL(arr[arr.length - 1].time, {
          zone: "utc",
        });
        setFirstTime(
          DateTime.now().set({ hour: startTime.hour, minute: startTime.minute })
        );
        setFinishTime(
          DateTime.now().set({ hour: endTime.hour, minute: endTime.minute })
        );

        return item;
      });
    return items;
  }, [event]);

  const handleParticipateClick = () => {
    if (event && id) {
      navigate(`/event/${id}/prizes`, { state: { event: event } });
    }
  };

  if (!event) {
    return (
      <Page>
        <div className="p-4 bg-black text-white min-h-screen">Loading...</div>
      </Page>
    );
  }

  return (
    <Page back={true}>
      <div className="p-4 bg-black text-white min-h-screen">
        <div className="h-[159px] relative">
          <div
            className="absolute inset-[0]"
            style={{ background: "#707579" }}
          ></div>
          <div
            className="absolute inset-[0]"
            style={{
              background:
                "linear-gradient(to bottom, #171819, rgba(23, 24, 25, 0))",
            }}
          ></div>
        </div>

        <div className="flex flex-col px-[20px] gap-[8px]">
          <div className="flex flex-col px-[4px] pt-[20px] pb-[12px] gap-[4px] text-[white]">
            <span className="text-h1 text-[white]">{event.name}</span>
            <div>
              <span className="text-h4">
                {DateTime.fromSQL(event.date).toFormat("dd.MM.yyyy")},{" "}
                {DateTime.fromSQL(event.startTime, { zone: "utc" })
                  .setZone("Europe/Moscow")
                  .toFormat("HH:mm") + " MSK"}
              </span>
            </div>
          </div>

          <div className="bg-[#202223] rounded-[12px]">
            <div className="flex flex-col px-[16px] py-[12px]">
              <span className="text-h5">Description</span>
              <span className="text-h3 text-[white]">{event.description}</span>
            </div>

            <div className="flex flex-col px-[16px] py-[12px]">
              <span className="text-h5">Location</span>
              <span className="text-h3 text-[white]">{event.address}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-h2 px-[20px] py-[14px] mt-[16px] text-[white]">
            Программа конференции
          </div>

          <div className="mt-[32px] pl-[20px] pr-[30px]">
            <div className="relative">
              {program.map((item, index, arr) => (
                <div
                  key={index}
                  className="flex flex-row gap-[32px] items-start"
                >
                  <div className="relative w-4 shrink-0">
                    <div
                      className="w-[16px] h-[16px] rounded-full top-[6px] absolute left-0"
                      style={{
                        background: `${
                          timeNow?.toMillis() > item.timeToCalculate
                            ? "#ffe600"
                            : "#FFF"
                        } `,
                      }}
                    ></div>
                    {arr.length - 1 !== index && (
                      <div
                        className="absolute w-[3px] bg-[#ffe600] h-[80px] left-[6.5px] top-[22px]"
                        style={{
                          background: `${
                            timeNow?.toMillis() > item.timeToCalculate
                              ? "#ffe600"
                              : "#FFF"
                          } `,
                        }}
                      ></div>
                    )}
                  </div>
                  {item.type === "action" ? (
                    <div className="bg-[#202223] flex p-[12px] items-center rounded-[12px] justify-between grow-1 mb-[22px]">
                      <div className="flex flex-col">
                        <span className="text-h3-bold text-white text-[white]">
                          {item.title}
                        </span>
                        <span className="text-h5 text-white">
                          {item.labelTime}
                        </span>
                      </div>
                      <button
                        disabled={raffleStatus !== "started"}
                        className="button-yellow h-[42px] min-w-[126px] text-h4-bold"
                        style={{
                          backgroundColor:
                            raffleStatus !== "started"
                              ? "#707579"
                              : "var(--main-yellow)",
                        }}
                        onClick={handleParticipateClick}
                      >
                        {item.actionText}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-[4px] pb-[24px] mb-[22px]">
                      <span className="text-h3-bold text-[white]">
                        {item.title}
                      </span>
                      <span className="text-h5">{item.labelTime}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default EventPage;
