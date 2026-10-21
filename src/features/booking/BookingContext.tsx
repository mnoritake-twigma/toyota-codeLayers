import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { DealerResult, DealerVehicle, Model } from "../../types";
export interface Info {
  name: string;
  kana: string;
  email: string;
  phone: string;
  preferred1: string;
  preferred2: string;
  notes: string;
}
const emptyInfo: Info = {
  name: "",
  kana: "",
  email: "",
  phone: "",
  preferred1: "",
  preferred2: "",
  notes: "",
};
interface Booking {
  model: Model | null;
  dealer: DealerResult | null;
  vehicle: DealerVehicle | null;
  info: Info;
  receipt: string;
  offline: boolean;
}
const initial: Booking = {
  model: null,
  dealer: null,
  vehicle: null,
  info: emptyInfo,
  receipt: "",
  offline: false,
};
const Context = createContext<{
  booking: Booking;
  update: (patch: Partial<Booking>) => void;
  reset: () => void;
} | null>(null);
export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState(initial);
  const update = useCallback(
    (patch: Partial<Booking>) => setBooking((v) => ({ ...v, ...patch })),
    [],
  );
  return (
    <Context.Provider
      value={{
        booking,
        update,
        reset: () => setBooking({ ...initial, info: { ...emptyInfo } }),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useBooking() {
  const value = useContext(Context);
  if (!value) throw new Error("BookingProvider is required");
  return value;
}
export const toJapanIso = (local: string) => (local ? `${local}:00+09:00` : "");
export const displayDate = (local: string) =>
  local ? local.replace("T", " ") + "（日本時間）" : "未入力";
