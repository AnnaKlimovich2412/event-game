import { DateTime } from "luxon";
import { firstValueFrom, map } from "rxjs";
import { ajax, AjaxResponse } from "rxjs/ajax";
import { CreateEventResponce, SuccessResponse } from "../types/api";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const API_IMAGE_URL = import.meta.env.VITE_API_IMAGE_URL;
export const API_START = import.meta.env.VITE_API_START;

export function start(id: number) {
  const res$ = ajax<{ token: string }>({
    url: API_START,
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    // TODO: hardcoded user id
    body: JSON.stringify({ tg_id: "935078579" }),
  }).pipe(map((response) => response.response));

  return firstValueFrom(res$);
}

export function subscribeRaflle(raffleId: string) {
  const res$ = ajax<{ token: string }>({
    url: API_BASE_URL + "/raffle/subscribe/" + raffleId,
    method: "POST",
    headers: getHeaders(),
  }).pipe(map((response) => response.response));

  return firstValueFrom(res$);
}

export function getEvents(): Promise<CreateEventResponce[]> {
  const currentDate = DateTime.now().toFormat("yyyy-MM-dd");
  const res$ = ajax<SuccessResponse<CreateEventResponce[]>>({
    url: `${API_BASE_URL}/list?date=${currentDate}`,
    method: "GET",
    headers: getHeaders(),
  }).pipe(map((response) => response.response.data));

  return firstValueFrom(res$);
}

export async function getEventById(id: number): Promise<CreateEventResponce> {
  const res = ajax<SuccessResponse<CreateEventResponce>>({
    url: `${API_BASE_URL}/view/${id}`,
    method: "GET",
    headers: getHeaders(),
  }).pipe(map((response) => response.response.data));

  return firstValueFrom(res);
}

export async function imageRetrieve(type: string, name: string): Promise<Blob> {
  const res$ = ajax<Blob>({
    url: `${API_IMAGE_URL}?type=${type}&name=${encodeURIComponent(name)}`,
    method: "GET",
    responseType: "blob",
    headers: getHeaders(),
  });
  const ajaxResponse: AjaxResponse<Blob> = await firstValueFrom(res$);
  return ajaxResponse.response;
}

const getHeaders = () => {
  return {
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  };
};
