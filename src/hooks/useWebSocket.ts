import { useEffect, useState } from "react";
import {
  webSocketService,
  WebSocketMessage,
  SavePlaceMessage,
} from "../services/WebSocketService";

export interface UseWebSocketOptions {}

export const useWebSocket = (
  raffleId?: string,
  options: UseWebSocketOptions = {}
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  useEffect(() => {
    if (!raffleId) return;

    webSocketService.connect(raffleId);

    const connectionSub =
      webSocketService.connectionStatus$.subscribe(setIsConnected);

    const messagesSub = webSocketService.messages$.subscribe((message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
    });

    setIsConnected(webSocketService.getConnectionStatus());

    return () => {
      connectionSub.unsubscribe();
      messagesSub.unsubscribe();
      webSocketService.disconnect();
    };
  }, [raffleId]);

  const sendMessage = (data: SavePlaceMessage) => {
    webSocketService.sendMessage(data);
  };

  const connect = (newRaffleId: string) => {
    webSocketService.connect(newRaffleId);
  };

  const disconnect = () => {
    webSocketService.disconnect();
  };

  const clearMessages = () => {
    setMessages([]);
    setLastMessage(null);
  };

  return {
    isConnected,
    messages,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    clearMessages,
  };
};
