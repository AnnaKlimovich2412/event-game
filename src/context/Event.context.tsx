import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import type { EventResponce, Raffle } from "../types/api";
import { DateTime } from "luxon";
import { getEventById } from "../api/events";

type EventContextType = {
  event: EventResponce | null;
  raffle: Raffle | null;
  registration: boolean;
  raffleStatus: string | null;
  gameInProcess: boolean;
  subscriptions: any[];
  loading: boolean;
  error: string | null;
  fetchEvent: (eventId: number) => Promise<void>;
  startPolling: (eventId: number) => void;
  stopPolling: () => void;
  clearEvent: () => void;
};

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvent must be used within EventProvider");
  }
  return context;
};

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [event, setEvent] = useState<EventResponce | null>(null);
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [registration, setRegistration] = useState<boolean>(false);
  const [gameInProcess, setGameInProcess] = useState<boolean>(false);
  const [raffleStatus, setRaffleStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSetEvent = (eventData: EventResponce | null) => {
    if (!eventData) {
      setEvent(null);
      setRaffle(null);
      setRegistration(false);
      setRaffleStatus(null);
      return;
    }
    setEvent(eventData);
    setRaffleStatus(eventData.raffleStatus);
    setSubscriptions(event?.subscriptions || []);
    const transformedRaffle = eventTransformData(eventData);
    setRegistration(
      !!(transformedRaffle.startedAt && !transformedRaffle.openAt)
    );
    setGameInProcess(
      !!(transformedRaffle.startedAt && transformedRaffle.openAt)
    );
    if (transformedRaffle?.openUntilAtTimeStamp < DateTime.now().toMillis()) {
      setGameInProcess(false);
    }
    if (eventData.raffleStatus === "end") {
      stopPolling();
    }
    setRaffle(transformedRaffle);
  };

  const fetchEvent = useCallback(async (eventId: number) => {
    try {
      setLoading(true);
      setError(null);

      const data = await getEventById(eventId);
      handleSetEvent(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error fetching event:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const startPolling = useCallback((eventId: number) => {
    stopPolling();

    const pollData = async () => {
      try {
        const data = await getEventById(eventId);
        handleSetEvent(data);
      } catch (err) {
        console.error("Error polling event:", err);
      }
    };
    pollData();
    intervalRef.current = setInterval(pollData, 2000);
  }, []);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const clearEvent = useCallback(() => {
    stopPolling();
    setEvent(null);
    setRaffle(null);
    setRegistration(false);
    setRaffleStatus(null);
    setError(null);
  }, [stopPolling]);

  return (
    <EventContext.Provider
      value={{
        event,
        raffle,
        registration: registration,
        raffleStatus,
        gameInProcess,
        subscriptions,
        loading,
        error,
        fetchEvent,
        startPolling,
        stopPolling,
        clearEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

const eventTransformData = (event: EventResponce): Raffle => {
  const raffle = event.raffles[0];

  const convertToLocalTimestamp = (dateTimeString: string): DateTime => {
    return DateTime.fromSQL(dateTimeString, { zone: "utc" }).setZone("local");
  };

  const transformedRaffle = {
    ...raffle,
    openAt: raffle.openAt
      ? convertToLocalTimestamp(raffle.openAt)?.toSQL()
      : null,
    openAtTimeStamp: raffle.openAt
      ? convertToLocalTimestamp(raffle.openAt).toMillis()
      : null,
    openUntilAt: raffle.openUntilAt
      ? convertToLocalTimestamp(raffle.openUntilAt)?.toSQL()
      : null,
    openUntilAtTimeStamp: raffle.openUntilAt
      ? convertToLocalTimestamp(raffle.openUntilAt)?.toMillis()
      : null,
    startedAt: raffle.startedAt
      ? convertToLocalTimestamp(raffle.startedAt).toSQL()
      : null,
    startedAtTimeStamp: raffle.startedAt
      ? convertToLocalTimestamp(raffle.startedAt).toMillis()
      : null,
  } satisfies Raffle;

  return transformedRaffle;
};
