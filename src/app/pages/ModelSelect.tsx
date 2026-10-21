import { Button, SectionHeading } from "../../ds";
import { useNavigate } from "react-router-dom";
import models from "../../data/seed/models.json";
import { ModelCard } from "../../components/ModelCard";
import { useBooking } from "../../features/booking/BookingContext";
export function ModelSelect() {
  const { booking, update } = useBooking();
  const navigate = useNavigate();
  return (
    <section>
      <div className="ds-stack">
        <SectionHeading>ご希望のモデルをお選びください</SectionHeading>
        <p className="ds-hint">気になる一台を、試乗でお確かめください。</p>
      </div>
      <div className="ds-stack">
        {models.map((model) => (
          <ModelCard
            key={model.code}
            model={model}
            selected={booking.model?.code === model.code}
            onSelect={(m) =>
              update({ model: m, dealer: null, vehicle: null, receipt: "" })
            }
          />
        ))}
      </div>
      <div className="ds-actions">
        <Button
          variant="primary"
          disabled={!booking.model}
          onClick={() => navigate("/dealers")}
        >
          販売店を選択する →
        </Button>
      </div>
    </section>
  );
}
