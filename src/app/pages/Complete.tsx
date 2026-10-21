import { Button, SectionHeading } from '../../ds';
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../features/booking/BookingContext";
export function Complete() {
  const { booking, reset } = useBooking();
  const navigate = useNavigate();
  return (
    <section className="ds-stack">
      <p className="ds-hint">THANK YOU</p>
      <SectionHeading>お申し込みを受け付けました</SectionHeading>
      <p className="ds-stack">販売店より確認のご連絡を差し上げます。</p>
      <p className="ds-hint">
        試乗日時はまだ確定しておりません。
      </p>
      <div className="ds-stack">
        <p className="ds-hint">受付番号</p>
        <p className="ds-subtitle">{booking.receipt}</p>
      </div>
      <Button variant="secondary"
        onClick={() => {
          reset();
          navigate("/", { replace: true });
        }}
      >
        モデル選択へ戻る
      </Button>
    </section>
  );
}
