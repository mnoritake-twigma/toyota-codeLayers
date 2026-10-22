import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  DescriptionList,
  EmptyState,
  FilterLayout,
  Notice,
  SectionHeading,
  Select,
  Skeleton,
  Spinner,
  StickySummary,
  TextButton,
} from "../../ds";
import { groupDealers } from "../../features/dealers/sortDealers";
import {
  buildVehicleCards,
  filterVehicleCards,
  relaxationMessage,
  vehicleFilterOptions,
  type VehicleFilters,
} from "../../features/dealers/filterVehicles";
import { DealerCard } from "../../components/DealerCard";
import { useDealerSearch } from "../../features/dealers/useDealerSearch";
import { useBooking } from "../../features/booking/BookingContext";
import { demoStart } from "../../demo/startAt";

const emptyFilters: VehicleFilters = { grade: "", bodyColor: "", area: "" };

export function DealerSelect() {
  const { booking, update } = useBooking();
  const navigate = useNavigate();
  const result = useDealerSearch();
  const started = useRef(false);
  const [filters, setFilters] = useState(emptyFilters);
  const groups = groupDealers(result.dealers);
  const cards = useMemo(
    () => buildVehicleCards(groups.registered),
    [groups.registered],
  );
  const options = useMemo(() => vehicleFilterOptions(cards), [cards]);
  const filtered = useMemo(
    () => filterVehicleCards(cards, filters),
    [cards, filters],
  );
  const filterKey = `${filters.grade}-${filters.bodyColor}-${filters.area}`;

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void result.search({
      modelCode: booking.model!.code,
      prefectureCode: demoStart.prefectureCode,
    });
  }, []);
  useEffect(() => {
    if (result.status === "success") update({ offline: result.offline });
  }, [result.status, result.offline, update]);

  const setFilter = (key: keyof VehicleFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    if (booking.vehicle) update({ dealer: null, vehicle: null });
  };

  return (
    <section>
      <SectionHeading required>
        乗りたい試乗車と販売店をお選びください
      </SectionHeading>
      <p className="ds-hint">
        グレード・ボディカラー・エリアを組み合わせて、東京都の試乗車を探せます。
      </p>
      {result.message && (
        <Notice variant={result.status === "error" ? "error" : "info"}>
          {result.message}
        </Notice>
      )}
      <div aria-live="polite" aria-busy={result.status === "loading"}>
        {result.status === "loading" && (
          <div className="ds-loading">
            <Spinner />
            <p>試乗車情報を読み込んでいます…</p>
            <Skeleton />
          </div>
        )}
        {result.status === "success" && (
          <FilterLayout
            filters={
              <div className="ds-stack">
                <div>
                  <p className="ds-subtitle">絞り込み</p>
                  <p className="ds-hint">東京都・{booking.model?.name}</p>
                </div>
                <Select
                  label="グレード"
                  value={filters.grade}
                  onChange={(event) => setFilter("grade", event.target.value)}
                >
                  <option value="">
                    グレードは決めていない（近くで乗れる試乗車を見る）
                  </option>
                  {options.grades.map((grade) => (
                    <option key={grade}>{grade}</option>
                  ))}
                </Select>
                <Select
                  label="ボディカラー"
                  value={filters.bodyColor}
                  onChange={(event) =>
                    setFilter("bodyColor", event.target.value)
                  }
                >
                  <option value="">すべてのカラー</option>
                  {options.bodyColors.map((color) => (
                    <option key={color}>{color}</option>
                  ))}
                </Select>
                <Select
                  label="エリア"
                  value={filters.area}
                  onChange={(event) => setFilter("area", event.target.value)}
                >
                  <option value="">東京都内すべて</option>
                  {options.areas.map((area) => (
                    <option key={area}>{area}</option>
                  ))}
                </Select>
                <TextButton onClick={() => setFilters(emptyFilters)}>
                  条件をすべてクリア
                </TextButton>
              </div>
            }
            results={
              <div className="ds-stack">
                <StickySummary>
                  <div className="ds-row">
                    <div>
                      <span className="ds-hint">選択中</span>
                      <p>
                        {booking.vehicle
                          ? `${booking.vehicle.grade}・${booking.vehicle.body_color}`
                          : "試乗車を選択してください"}
                      </p>
                    </div>
                    {booking.dealer && (
                      <span className="ds-hint">{booking.dealer.name}</span>
                    )}
                  </div>
                </StickySummary>
                <div className="ds-row">
                  <p>
                    試乗車 <strong>{filtered.length}</strong> 台
                  </p>
                  <span className="ds-hint">条件を変えると一覧が更新されます</span>
                </div>
                {filtered.length === 0 ? (
                  <EmptyState title="条件に合う試乗車が見つかりませんでした。">
                    {relaxationMessage(cards, filters)}
                  </EmptyState>
                ) : (
                  <div className="ds-vehicle-results" key={filterKey}>
                    {filtered.map(({ dealer, vehicle, distanceKm }) => (
                      <DealerCard
                        key={vehicle.id}
                        dealer={dealer}
                        vehicle={vehicle}
                        distanceKm={distanceKm}
                        selected={booking.vehicle?.id === vehicle.id}
                        onSelect={(selectedDealer, selectedVehicle) =>
                          update({
                            dealer: selectedDealer,
                            vehicle: selectedVehicle,
                            offline: result.offline,
                          })
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            }
          />
        )}
      </div>
      {result.status === "success" && groups.telephone.length > 0 && (
        <div className="ds-telephone-group">
          <SectionHeading>電話で問い合わせする</SectionHeading>
          <p className="ds-hint">
            下記の販売店には選択中のモデルの試乗車登録がございません。試乗車をご用意できる場合がございますので、販売店へお問い合わせください。
          </p>
          <div className="ds-dealer-list">
            {groups.telephone.map((dealer) => (
              <article className="ds-phone-card" key={dealer.id}>
                <p>{dealer.name}</p>
                <DescriptionList
                  items={[
                    { label: "住所", value: dealer.address },
                    {
                      label: "電話番号",
                      value: <a href={`tel:${dealer.phone}`}>{dealer.phone}</a>,
                    },
                  ]}
                />
              </article>
            ))}
          </div>
        </div>
      )}
      <div className="ds-actions">
        <Button variant="secondary" onClick={() => navigate("/")}>
          モデルを選び直す
        </Button>
        <Button
          disabled={!booking.vehicle || result.status === "loading"}
          onClick={() => navigate("/information")}
        >
          この試乗車で情報の入力へ →
        </Button>
      </div>
    </section>
  );
}
