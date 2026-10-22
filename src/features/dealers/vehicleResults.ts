import type { DealerResult } from "../../types";

export interface VehicleFilters {
  grade: string;
  bodyColor: string;
}

// Only the received rows are searchable; the API supplies no global facets or total.
export function vehicleResults(
  dealers: readonly DealerResult[],
  requested: VehicleFilters
) {
  const choices = dealers.flatMap((dealer) =>
    dealer.vehicles.map((vehicle) => ({ dealer, vehicle }))
  );
  const unique = (values: string[]) => [...new Set(values)].sort();
  const grades = unique(choices.map(({ vehicle }) => vehicle.grade));
  const bodyColors = unique(choices.map(({ vehicle }) => vehicle.body_color));
  const filters = {
    grade: grades.includes(requested.grade) ? requested.grade : "",
    bodyColor: bodyColors.includes(requested.bodyColor)
      ? requested.bodyColor
      : "",
  };
  const filteredChoices = choices.filter(
    ({ vehicle }) =>
      (!filters.grade || vehicle.grade === filters.grade) &&
      (!filters.bodyColor || vehicle.body_color === filters.bodyColor)
  );
  return { grades, bodyColors, filters, filteredChoices };
}
