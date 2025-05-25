import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./GamePage.module.css";
import ModalPopup from "../components/popUps/ModalPopUp";
import { Page } from "../components/Page";
import { subscribeRaflle } from "../api/events";
import { useWebSocket } from "../hooks/useWebSocket";
import { useEvent } from "../context/Event.context";
import { useEventPolling } from "../hooks/useEventPolling";
import { DateTime } from "luxon";

type PopupContentType = "startGame" | "congratulations" | "tryAgain" | null;

const GamePage: React.FC = () => {
  const { raffleId } = useParams<{ raffleId: string }>();

  useEventPolling();

  const container = useRef(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const [popupContent, setPopupContent] =
    useState<PopupContentType>("congratulations");
  const [promoCode, setPromoCode] = useState("TESTCODE");
  const [selectedField, setSelectedField] = useState<number | null>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [showAlredyUsed, setShowAlredyUsed] = useState<boolean>(false);
  const [showelAvailable, setShowelAvailable] = useState<boolean>(true);
  const [gameTimeRemaining, setGameTimeRemaining] = useState<string>("0:00");

  const { registration, raffle, gameInProcess } = useEvent();

  const { isConnected, lastMessage, sendMessage } = useWebSocket(raffle?.id);

  const formatGameTime = (targetTime: number): string => {
    if (!targetTime) return "0:00";

    const target = DateTime.fromMillis(targetTime);
    const now = DateTime.now();
    const diff = target.diff(now, ["minutes", "seconds"]);

    if (diff.toMillis() <= 0) return "0:00";

    const minutes = Math.floor(diff.minutes);
    const seconds = Math.floor(diff.seconds % 60);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const time = raffle?.openUntilAtTimeStamp;
    if (!time) return;

    const updateGameTimer = () => {
      setGameTimeRemaining(formatGameTime(time));
    };

    updateGameTimer();
    const interval = setInterval(updateGameTimer, 1000);

    return () => clearInterval(interval);
  }, [raffle?.openUntilAtTimeStamp]);

  useEffect(() => {
    if (raffleId) {
      subscribeRaflle(raffleId);
    }
  }, [raffleId]);

  useEffect(() => {
    if (lastMessage) {
      if (lastMessage?.fields) {
        setFields(lastMessage.fields);
      }
      if (lastMessage?.is_selected) {
        setShowelAvailable(false);
      }
      if (lastMessage.type === "already_used") {
        setShowAlredyUsed(true);
        setSelectedField(null);
        setTimeout(() => {
          setShowAlredyUsed(false);
        }, 1500);
      }
      if (lastMessage.type === "reserved") {
        if (lastMessage.number === selectedField) {
          setShowelAvailable(false);
        }
      }
      if (lastMessage.type === "winner_info") {
        const code = lastMessage.winner;

        if (!lastMessage.winner) {
          showPopup("tryAgain");
        } else if (typeof code === "number") {
          showPopup("congratulations", code);
        }
      }
    }
  }, [lastMessage]);

  const savePlace = () => {
    const seleced = selectedField;
    if (!raffleId || !seleced) {
      console.warn("No raffle ID available for savePlace");
      return;
    }

    const message = {
      raffle_id: raffleId,
      field_number: seleced,
    };
    sendMessage(message);
  };

  const showPopup = (contentType: PopupContentType, code?: string) => {
    setPopupContent(contentType);
    if (code) setPromoCode(code);
    setIsPopupVisible(true);
  };

  const hidePopup = () => {
    setIsPopupVisible(false);
    setPopupContent(null);
  };

  const handleOpenClick = () => {
    savePlace();
  };

  return (
    <Page back={true}>
      <div className="relative h-[100vh] flex flex-col">
        <div
          className={`absolute top-2 right-2 p-2 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
          title={isConnected ? "Connected" : "Disconnected"}
        ></div>

        {showAlredyUsed && (
          <div className="w-[100%] animate-bounce fixed h-max z-10 top-[235px] bg-[black]">
            <div className={styles.occupied}>
              <span className="text-[23px]">😱</span> Этот гекс занят, выберите
              другой
            </div>
          </div>
        )}

        <div className={styles.gridPageContainer}>
          <div className={styles.instruments}>
            <div className={styles.showel}>
              <img
                src="../../assets/showel.png"
                alt="showel"
                className="p-[12px]"
              ></img>
              <span className="text-h3-bold text-[white]">
                x {showelAvailable ? 1 : 0}
              </span>
            </div>
            {gameInProcess && (
              <div className={styles.timer}>
                <span className="text-h5">до конца игры</span>
                <span
                  className="text-[#FC423F] font-bold text-[34px] leading-[41px] tracking-[0.4px]"
                  style={{ fontWeight: "700" }}
                >
                  {gameTimeRemaining}
                </span>
              </div>
            )}
          </div>
          <div className={styles.gridContainer}>
            <div ref={container} className={styles.listContainer}>
              {raffle?.fields.map((item) => {
                return (
                  <div
                    data-selected={selectedField === item.number}
                    key={item.id}
                    onClick={() =>
                      showelAvailable && setSelectedField(item.number)
                    }
                  ></div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.buttonContainer}>
          <button
            disabled={!showelAvailable}
            className={`${
              showelAvailable ? "button-yellow" : "button-gray"
            } h-[60px] text-h2 w-full`}
            onClick={handleOpenClick}
          >
            Open
          </button>
        </div>

        {registration && (
          <ModalPopup contentType={"startGame"} onClose={hidePopup} />
        )}

        {isPopupVisible && (
          <ModalPopup
            contentType={popupContent}
            promoCode={promoCode}
            onClose={hidePopup}
          />
        )}
      </div>
    </Page>
  );
};

export default GamePage;
