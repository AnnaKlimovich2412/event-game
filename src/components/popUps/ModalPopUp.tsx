import React, { useEffect, useState } from "react";
import { Page } from "../Page";
import { useEvent } from "../../context/Event.context";
import { DateTime } from "luxon";

export type PopupContentType =
  | "startGame"
  | "congratulations"
  | "tryAgain"
  | null;

interface ModalPopupProps {
  onClose: () => void;
  contentType?: PopupContentType;
  promoCode?: string;
}

const ModalPopup: React.FC<ModalPopupProps> = ({
  onClose,
  contentType,
  promoCode,
}) => {
  const { raffle, registration } = useEvent();
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  const formatTimeRemaining = (targetTimestamp: number): string => {
    const now = DateTime.now().toMillis();
    const diff = targetTimestamp - now;

    if (diff <= 0) return "00:00";

    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getGameEndTime = (): number | null => {
    if (!raffle?.startedAtTimeStamp) return null;

    const storageKey = `registration_${raffle.id}`;
    const storedEndTime = localStorage.getItem(storageKey);

    if (storedEndTime) {
      return parseInt(storedEndTime);
    }

    const gameEndTime = raffle.startedAtTimeStamp + 5 * 60 * 1000;
    localStorage.setItem(storageKey, gameEndTime.toString());
    return gameEndTime;
  };

  useEffect(() => {
    const gameEndTime = getGameEndTime();
    if (!gameEndTime) return;

    const updateTimer = () => {
      setTimeRemaining(formatTimeRemaining(gameEndTime));
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [raffle?.startedAtTimeStamp, raffle?.id]);

  useEffect(() => {
    if (registration === false && raffle?.id) {
      const storageKey = `registration_${raffle.id}`;
      localStorage.removeItem(storageKey);
    }
  }, [registration]);

  const renderTypedContent = () => {
    switch (contentType) {
      case "startGame":
        return (
          <div className="text-center py-4">
            <p className="text-h3-bold text-[white]">До начала игры</p>
            <div className="flex flex-col items-center gap-2">
              <p
                className="text-[#34C759] font-bold text-[34px] leading-[63px] tracking-[-0.08px]"
                style={{ fontWeight: "700" }}
              >
                {timeRemaining || "05:00"}
              </p>
            </div>
          </div>
        );
      case "congratulations":
        return (
          <div className="flex flex-col items-center justify-center text-center gap-[16px]">
            <div className="text-[34px]">🥳</div>
            <div className="flex flex-col gap-[9px]">
              <span className="text-h3-bold text-[white]">
                Congratulations!
              </span>
              <p className="text-[13px] font-[400] leading-[18px] tracking-[-0.08px] text-[white]">
                Покажите этот код ведущему
              </p>
              <div className="bg-[#707579] rounded-[10px] min-h-[128px] flex items-center justify-center">
                {promoCode}
              </div>
            </div>
            <button
              onClick={onClose}
              className="button-yellow h-[42px] text-h4-bold w-full"
            >
              Good!
            </button>
          </div>
        );
      case "tryAgain":
        return (
          <div className="flex flex-col items-center justify-center text-center gap-[16px]">
            <div className="flex flex-col gap-[9px]">
              <div className="text-[34px]">😓</div>
              <span className="text-h3-bold text-[white]">Ничего не вышло</span>
              <p className="text-[13px] font-[400] leading-[18px] tracking-[-0.08px] text-[white]">
                В этот раз вам не попался приз, но еще обязательно повезет!
              </p>
            </div>
            <button
              onClick={onClose}
              className="button-yellow h-[42px] text-h4-bold w-full"
            >
              Good!
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Page>
      <div
        className="h-[100vh] w-[100vw] fixed inset-0 flex justify-center items-center z-50"
        style={{
          backdropFilter: "brightness(0.75) blur(3px)",
        }}
      >
        <div className="bg-[#171717] w-[100%] text-white mx-[60px] pt-[19px] px-[16px] pb-[15px] rounded-[14px]">
          {renderTypedContent()}
        </div>
      </div>
    </Page>
  );
};

export default ModalPopup;
