import { Button, SectionHeading, TextField, Textarea } from "../../ds";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useBooking,
  toJapanIso,
  type Info,
} from "../../features/booking/BookingContext";
import { PreferredDateTimeField } from "../../components/PreferredDateTimeField";
import { validateRequest } from "../../../supabase/functions/_shared/validate";
export function InfoInput() {
  const { booking, update } = useBooking();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const set = (key: keyof Info, value: string) =>
    update({ info: { ...booking.info, [key]: value } });
  return (
    <section>
      <SectionHeading>お客様情報をご入力ください</SectionHeading>
      <p className="ds-hint">
        {booking.model?.name} ／ {booking.dealer?.name}
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const message = validateRequest({
            ...booking.info,
            modelCode: booking.model!.code,
            dealerId: booking.dealer!.id,
            vehicleId: booking.vehicle!.id,
            preferred1: toJapanIso(booking.info.preferred1),
            preferred2: toJapanIso(booking.info.preferred2),
          });
          if (message) {
            setError(message);
            return;
          }
          navigate("/confirm");
        }}
      >
        <div className="ds-stack">
          <h3 className="ds-subtitle">お客様について</h3>
          <div className="ds-stack">
            {(
              [
                { key: "name", label: "氏名", auto: "name", max: 100 },
                { key: "kana", label: "フリガナ", auto: "off", max: 100 },
                {
                  key: "email",
                  label: "メールアドレス",
                  type: "email",
                  auto: "email",
                  max: 254,
                },
                {
                  key: "phone",
                  label: "電話番号",
                  type: "tel",
                  auto: "tel",
                  max: 20,
                },
              ] as const
            ).map((field) => (
              <TextField
                key={field.key}
                label={field.label}
                required
                type={"type" in field ? field.type : "text"}
                autoComplete={field.auto}
                maxLength={field.max}
                value={booking.info[field.key]}
                onChange={(e) => set(field.key, e.target.value)}
                hint={
                  field.key === "kana"
                    ? "全角カタカナでご入力ください。"
                    : undefined
                }
              />
            ))}
          </div>
          <div className="ds-stack">
            <h3 className="ds-subtitle">ご希望の日時</h3>
            <p className="ds-hint">
              ご希望の日時を2つご指定ください。販売店より確認のご連絡を差し上げます。
            </p>
            <div className="ds-stack">
              <PreferredDateTimeField
                id="preferred1"
                label="第1希望日時"
                value={booking.info.preferred1}
                onChange={(v) => set("preferred1", v)}
              />
              <PreferredDateTimeField
                id="preferred2"
                label="第2希望日時"
                value={booking.info.preferred2}
                onChange={(v) => set("preferred2", v)}
              />
            </div>
          </div>
          <Textarea
            label="備考（任意）"
            rows={4}
            maxLength={2000}
            value={booking.info.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>
        {error && (
          <p role="alert" className="ds-error">
            {error}
          </p>
        )}
        <p className="ds-hint">
          デモ用のため、実際の個人情報は入力しないでください。
        </p>
        <div className="ds-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/dealers")}
          >
            戻る
          </Button>
          <Button variant="primary">入力内容の確認へ →</Button>
        </div>
      </form>
    </section>
  );
}
