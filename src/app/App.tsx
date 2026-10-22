import { useEffect, lazy, Suspense, useRef } from "react";
import {
  Routes,
  Route,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Header, PageLayout, Stepper, Notice } from "../ds";
import { useBooking } from "../features/booking/BookingContext";
import { isConfigured } from "../api/client";
import { demoStart } from "../demo/startAt";
const Catalog = lazy(() =>
  import("./ds-catalog/Catalog").then((m) => ({ default: m.Catalog })),
);

import { ModelSelect } from "./pages/ModelSelect";
import { DealerSelect } from "./pages/DealerSelect";
import { InfoInput } from "./pages/InfoInput";
import { Confirm } from "./pages/Confirm";
import { Complete } from "./pages/Complete";
const paths = ["/", "/dealers", "/information", "/confirm", "/complete"];
export function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking } = useBooking();
  const demoStarted = useRef(false);
  const step = Math.max(1, paths.indexOf(location.pathname) + 1);
  const catalog = location.pathname === "/ds";
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = catalog
      ? "LUMIÈRE DS"
      : `試乗お申し込み ${step}/5 | LUMIÈRE`;
    document.querySelector<HTMLElement>("#main-heading")?.focus();
  }, [location.pathname, step, catalog]);
  useEffect(() => {
    if (
      demoStart.enabled &&
      !demoStarted.current &&
      location.pathname === "/"
    ) {
      demoStarted.current = true;
      navigate("/dealers", { replace: true });
    }
  }, [location.pathname, navigate]);
  return (
    <>
      <a href="#main" className="ds-sr-only ds-skip">
        本文へ移動
      </a>
      <Header onHome={() => navigate("/")} />
      <PageLayout id="main" data-code-layer={demoStart.layerName}>
        {!catalog && (
          <>
            <h1 id="main-heading" tabIndex={-1} className="ds-title">
              試乗お申し込み
            </h1>
            {(!isConfigured() || booking.offline) && (
              <Notice>オフラインデータで表示中</Notice>
            )}
            <Stepper step={step} />
          </>
        )}
        <Routes>
          <Route
            path="/ds"
            element={
              <Suspense fallback={<Notice>読み込んでいます…</Notice>}>
                <Catalog />
              </Suspense>
            }
          />
          <Route path="/" element={<ModelSelect />} />
          <Route
            path="/dealers"
            element={
              booking.model ? <DealerSelect /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/information"
            element={
              booking.vehicle ? (
                <InfoInput />
              ) : (
                <Navigate to="/dealers" replace />
              )
            }
          />
          <Route
            path="/confirm"
            element={
              booking.vehicle && booking.info.name ? (
                <Confirm />
              ) : (
                <Navigate to="/information" replace />
              )
            }
          />
          <Route
            path="/complete"
            element={
              booking.receipt ? <Complete /> : <Navigate to="/" replace />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageLayout>
      <footer className="ds-footer">LUMIÈRE — デモ用の架空サイトです</footer>
    </>
  );
}
