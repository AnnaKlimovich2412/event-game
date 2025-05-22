import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./GamePage.module.css";
import ModalPopup from "../components/popUps/ModalPopUp";
import { Page } from "../components/Page";
import { subscribeRaflle } from "../api/events";

type PopupContentType = "startGame" | "congratulations" | "tryAgain" | null;

// Define WebSocket message types
interface WebSocketMessage {
  type: string;
  data: any;
  fields?: unknown[];
}

const GamePage: React.FC = () => {
  // Get event ID from URL paramsF
  const { raffleId: raffleId } = useParams<{ raffleId: string }>();

  const container = useRef(null);
  const [isPopupVisible, setIsPopupVisible] = useState(true);
  const [popupContent, setPopupContent] =
    useState<PopupContentType>("congratulations");
  const [promoCode, setPromoCode] = useState("TESTCODE");
  const [fields, setFields] = useState<unknown[]>([]);

  // WebSocket state
  const [isConnected, setIsConnected] = useState(false);
  const webSocketRef = useRef<WebSocket | null>(null);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    if (raffleId) {
      subscribeRaflle(raffleId);
    }

    const connectWebSocket = () => {
      const token = localStorage.getItem("authToken");
      // Build WebSocket URL with query parameters that include necessary headers/information
      const wsUrl = new URL(`wss://wssgame.tmaevent.com`);

      wsUrl.searchParams.append("raffle_id", raffleId || "");
      wsUrl.searchParams.append("token", token || "");

      const ws = new WebSocket(wsUrl.toString());

      ws.onopen = () => {
        console.log("WebSocket connected for raffle:", raffleId);
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);

        // Optional: Reconnect logic
        setTimeout(() => {
          if (webSocketRef.current === null) {
            connectWebSocket();
          }
        }, 3000);
      };

      webSocketRef.current = ws;
    };

    connectWebSocket();

    // Cleanup on component unmount
    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
        webSocketRef.current = null;
      }
    };
  }, [raffleId]);

  const savePlace = (index: number) => {
    const message = {
      raffleId: raffleId,
      field_number: index,
    };
    sendMessage(message);
  };

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case "raffle_data":
        const fields = message.fields;
        if (fields) {
          setFields(fields);
        }

        break;
      case "gameStart":
        showPopup("startGame");
        break;
      default:
        console.log("Unknown message type:", message.type);
    }
  };

  // Function to send messages to the server
  const sendMessage = (data: any = {}) => {
    if (webSocketRef.current && isConnected) {
      webSocketRef.current.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket not connected, cannot send message");
    }
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
    // console.log("Open button clicked");
    // // Send game action to WebSocket server
    // sendMessage("gameAction", { action: "open" });
    // // For fallback or testing, you can keep the local logic
    // if (!isConnected) {
    //   const randomNumber = Math.random();
    //   if (randomNumber < 0.33) {
    //     showPopup("congratulations", "WINNER01");
    //   } else if (randomNumber < 0.66) {
    //     showPopup("tryAgain");
    //   } else {
    //     alert("Ничего не произошло в этот раз.");
    //   }
    // }
  };

  return (
    <Page back={true}>
      <div className="relative h-[100vh] flex flex-col">
        {/* Connection status indicator */}
        <div
          className={`absolute top-2 right-2 p-2 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
          title={isConnected ? "Connected" : "Disconnected"}
        ></div>

        <div className="relative">
          <div className=" h-[150px] w-[100%] bg-[black]">
            <div className={styles.occupied}>
              <span className="text-[23px]">😱</span> Этот гекс занят, выберите
              другой
            </div>
          </div>
        </div>

        <div className={styles.gridPageContainer}>
          <div className={styles.instruments}>
            <div className={styles.showel}>
              <img
                src="../../assets/showel.png"
                alt="showel"
                className="p-[12px]"
              ></img>
              <span className="text-h3-bold">x 1</span>
            </div>
            <div className={styles.timer}>
              <span className="text-h5">до конца игры</span>
              <span
                className="text-[#FC423F] font-bold text-[34px] leading-[41px] tracking-[0.4px]"
                style={{ fontWeight: "700" }}
              >
                2:20
              </span>
            </div>
          </div>
          <div className={styles.gridContainer}>
            <div ref={container} className={styles.listContainer}>
              {fields.map((item, i) => {
                return (
                  <div
                    key={item.id}
                    onClick={() => savePlace(item?.number)}
                  ></div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.buttonContainer}>
          <button
            className="button-yellow h-[60px] text-h2 w-full"
            onClick={handleOpenClick}
          >
            Open
          </button>
        </div>

        {isPopupVisible && (
          <ModalPopup
            isVisible={isPopupVisible}
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
