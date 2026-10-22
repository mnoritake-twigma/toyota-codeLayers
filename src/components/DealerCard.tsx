import { RadioCard } from "../ds";
import { VehicleTable } from "./VehicleTable";
import type { DealerResult, DealerVehicle } from "../types";
export function DealerCard({
  dealer,
  vehicle,
  distanceKm,
  selected,
  onSelect,
}: {
  dealer: DealerResult;
  vehicle: DealerVehicle;
  distanceKm: number;
  selected: boolean;
  onSelect: (dealer: DealerResult, vehicle: DealerVehicle) => void;
}) {
  return (
    <article className="ds-vehicle-card">
      <RadioCard
        variant="vehicle"
        name="vehicle"
        value={vehicle.id}
        selected={selected}
        onSelect={() => onSelect(dealer, vehicle)}
      >
        <VehicleTable
          vehicle={vehicle}
          distanceKm={distanceKm}
        />
        <span className="ds-card-dealer">{dealer.name}</span>
        <span className="ds-hint">{dealer.address}</span>
      </RadioCard>
    </article>
  );
}
