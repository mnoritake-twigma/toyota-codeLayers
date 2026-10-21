import { useNavigate } from "react-router-dom";
import { useBooking } from "../../features/booking/BookingContext";
export function Complete() {
  const { booking, reset } = useBooking();
  const navigate = useNavigate();
  return (
    <section className="panel text-center py-12">
      <p className="text-xs tracking-brand text-muted mb-5">THANK YOU</p>
      <h2 className="text-2xl">お申し込みを受け付けました</h2>
      <p className="mt-6">販売店より確認のご連絡を差し上げます。</p>
      <p className="text-sm text-muted mt-3">
        試乗日時はまだ確定しておりません。
      </p>
      <div className="bg-paper p-6 my-8">
        <p className="text-xs text-muted mb-2">受付番号</p>
        <p className="text-lg break-all">{booking.receipt}</p>
      </div>
      <button
        className="secondary"
        onClick={() => {
          reset();
          navigate("/", { replace: true });
        }}
      >
        モデル選択へ戻る
      </button>
    </section>
  );
}
