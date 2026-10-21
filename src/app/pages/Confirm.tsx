import { Button, SectionHeading, DescriptionList } from "../../ds";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useBooking,
  toJapanIso,
  displayDate,
} from "../../features/booking/BookingContext";
import { submitRequest } from "../../api/submitRequest";
export function Confirm() {
  const { booking, update } = useBooking();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const sending = useRef(false);
  const submit = async () => {
    if (sending.current) return;
    sending.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await submitRequest({
        ...booking.info,
        modelCode: booking.model!.code,
        dealerId: booking.dealer!.id,
        vehicleId: booking.vehicle!.id,
        preferred1: toJapanIso(booking.info.preferred1),
        preferred2: toJapanIso(booking.info.preferred2),
      });
      update({ receipt: result.receiptNumber });
      navigate("/complete", { replace: true });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "送信できませんでした。通信状態をご確認ください。",
      );
    } finally {
      setBusy(false);
      sending.current = false;
    }
  };
  const rows = [
    ["モデル", booking.model?.name],
    ["販売店", booking.dealer?.name],
    [
      "試乗車",
      `${booking.vehicle?.grade} / ${booking.vehicle?.body_color} / ${booking.vehicle?.interior_color}`,
    ],
    ["氏名", booking.info.name],
    ["フリガナ", booking.info.kana],
    ["メールアドレス", booking.info.email],
    ["電話番号", booking.info.phone],
    ["第1希望日時", displayDate(booking.info.preferred1)],
    ["第2希望日時", displayDate(booking.info.preferred2)],
    ["備考", booking.info.notes || "なし"],
  ];
  return (
    <section>
      <SectionHeading>お申し込み内容をご確認ください</SectionHeading>
      <p className="ds-hint">内容をご確認のうえ、お申し込みください。</p>
      <DescriptionList
        items={rows.map(([label, value]) => ({ label: label!, value }))}
      />

      <p className="ds-stack">
        このお申し込みで試乗日時は確定いたしません。販売店より確認のご連絡を差し上げます。
      </p>
      {error && (
        <div role="alert" className="ds-error">
          <p>{error}</p>
          <p className="ds-stack">
            受付は確認できておりません。通信切断時は重複送信を避けるため、販売店へお問い合わせください。
          </p>
        </div>
      )}
      <div className="ds-actions">
        {!busy && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/information")}
          >
            修正する
          </Button>
        )}
        <Button variant="primary" loading={busy} onClick={() => void submit()}>
          {busy ? "送信しています…" : "申し込む →"}
        </Button>
      </div>
    </section>
  );
}
