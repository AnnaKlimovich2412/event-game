import { useEffect, useMemo } from "react";
import { Navigate, Route, Routes, HashRouter } from "react-router-dom";
import {
  retrieveLaunchParams,
  useSignal,
  isMiniAppDark,
} from "@telegram-apps/sdk-react";
import { AppRoot } from "@telegram-apps/telegram-ui";
import { routes } from "../navigation/routes";
import { postEvent } from "@telegram-apps/sdk";
import { EventProvider } from "../context/Event.context";

export function App() {
  const lp = useMemo(() => retrieveLaunchParams(), []);
  const isDark = useSignal(isMiniAppDark);

  useEffect(() => {
    postEvent("web_app_request_fullscreen");
    postEvent("web_app_toggle_orientation_lock", { locked: true });
  }, []);

  return (
    <AppRoot
      appearance={"dark"}
      platform={["macos", "ios"].includes(lp.tgWebAppPlatform) ? "ios" : "base"}
    >
      <HashRouter>
        <EventProvider>
          <Routes>
            {routes.map((route) => (
              <Route key={route.path} {...route} />
            ))}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </EventProvider>
      </HashRouter>
    </AppRoot>
  );
}
