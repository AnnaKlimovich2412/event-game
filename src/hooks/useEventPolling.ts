import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useEvent } from "../context/Event.context";

export const useEventPolling = () => {
  const { id } = useParams<{ id: string }>();
  const { startPolling, clearEvent } = useEvent();

  useEffect(() => {
    if (!id) {
      clearEvent();
      return;
    }

    const eventId = Number(id);
    startPolling(eventId);
  }, [id, startPolling, clearEvent]);
};
