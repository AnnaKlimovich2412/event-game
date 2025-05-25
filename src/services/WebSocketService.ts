import { BehaviorSubject, Observable, Subject, EMPTY, interval } from "rxjs";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import {
  retryWhen,
  delay,
  takeUntil,
  catchError,
  tap,
  share,
} from "rxjs/operators";

export interface WebSocketMessage {
  type: string;
  data?: any;
  fields?: unknown[];
  is_selected: boolean;
  number: number;
  winner: boolean;
}

export interface SavePlaceMessage {
  raffle_id: string;
  field_number: number;
}

class WebSocketService {
  private ws$: WebSocketSubject<any> | null = null;
  private messagesSubject = new Subject<WebSocketMessage>();
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private destroy$ = new Subject<void>();
  private raffleId: string | null = null;
  private pingSubscription: any = null;

  connect(raffleId: string): void {
    if (this.raffleId === raffleId && this.ws$) {
      this.logConnectionState("Already connected to raffle");
      return;
    }

    this.logConnectionState("Connecting to raffle");
    this.disconnect();
    this.raffleId = raffleId;

    const token = localStorage.getItem("authToken");
    const wsUrl = new URL(`wss://wssgame.tmaevent.com`);
    wsUrl.searchParams.append("raffle_id", raffleId);
    wsUrl.searchParams.append("token", token || "");

    this.ws$ = webSocket({
      url: wsUrl.toString(),
      openObserver: {
        next: () => {
          console.log("[WebSocket] Connection opened successfully");
          this.connectionStatusSubject.next(true);
        },
      },
      closeObserver: {
        next: (event) => {
          console.log("[WebSocket] Connection closed:", event);
          this.connectionStatusSubject.next(false);
        },
      },
    });

    this.ws$
      .pipe(
        retryWhen((errors) =>
          errors.pipe(
            tap((error) => {
              console.error(
                "[WebSocket] Error occurred, will retry in 3 seconds:",
                error
              );
              this.connectionStatusSubject.next(false);
            }),
            delay(3000),
            takeUntil(this.destroy$)
          )
        ),
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error("WebSocket connection failed:", error);
          this.connectionStatusSubject.next(false);
          return EMPTY;
        })
      )
      .subscribe({
        next: (message: WebSocketMessage) => {
          console.log("Received WebSocket message:", message);
          try {
            if (message.type === "pong") {
              console.log("Received pong message");
              return;
            }
            this.messagesSubject.next(message);
          } catch (error) {
            console.error("Error processing WebSocket message:", error);
          }
        },
        error: (error) => {
          console.error("WebSocket subscription error:", error);
          this.connectionStatusSubject.next(false);
        },
      });
  }

  get connectionStatus$(): Observable<boolean> {
    return this.connectionStatusSubject.asObservable();
  }

  get messages$(): Observable<WebSocketMessage> {
    return this.messagesSubject.asObservable().pipe(share());
  }

  sendMessage(data: SavePlaceMessage): void {
    if (this.ws$ && this.connectionStatusSubject.value) {
      console.log("Sending savePlace message:", data);
      this.ws$.next(data);
    } else {
      console.warn("WebSocket not connected, cannot send savePlace message");
    }
  }

  getConnectionStatus(): boolean {
    return this.connectionStatusSubject.value;
  }

  disconnect(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$ = new Subject<void>();

    if (this.ws$) {
      this.ws$.complete();
      this.ws$ = null;
    }

    this.connectionStatusSubject.next(false);
    this.raffleId = null;
  }

  onConnectionChange(handler: (isConnected: boolean) => void): () => void {
    const subscription = this.connectionStatusSubject.subscribe(handler);
    return () => subscription.unsubscribe();
  }

  onMessage(handler: (message: WebSocketMessage) => void): () => void {
    const subscription = this.messagesSubject.subscribe(handler);
    return () => subscription.unsubscribe();
  }

  private logConnectionState(action: string): void {
    console.log(
      `[WebSocket] ${action} - raffleId: ${this.raffleId}, connected: ${this.connectionStatusSubject.value}`
    );
  }
}

export const webSocketService = new WebSocketService();
