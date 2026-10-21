import { useNavigate } from "react-router-dom";
import models from "../../data/seed/models.json";
import { ModelCard } from "../../components/ModelCard";
import { useBooking } from "../../features/booking/BookingContext";
export function ModelSelect() {
  const { booking, update } = useBooking();
  const navigate = useNavigate();
  return (
    <section>
      <div className="mb-8">
        <h2 className="text-xl">ご希望のモデルをお選びください</h2>
        <p className="text-sm text-muted mt-3">
          気になる一台を、試乗でお確かめください。
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {models.map((model) => (
          <ModelCard
            key={model.code}
            model={model}
            selected={booking.model?.code === model.code}
            onSelect={(m) => update({ model: m, dealer: null, receipt: "" })}
          />
        ))}
      </div>
      <div className="flex justify-end border-t border-line mt-10 pt-6">
        <button
          className="primary"
          disabled={!booking.model}
          onClick={() => navigate("/dealers")}
        >
          販売店を選択する →
        </button>
      </div>
    </section>
  );
}
