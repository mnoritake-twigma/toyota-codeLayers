import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  Button,
  EmptyState,
  Notice,
  SectionHeading,
  Select,
  Skeleton,
  Spinner,
  Tag,
  TextButton,
} from "../../ds";
import prefectures from "../../data/seed/prefectures.json";
import {
  countDealerVehiclesByArea,
  filterDealersByVehicles,
  type DealerArea,
} from "../../features/dealers/sortDealers";
import { useDealerSearch } from "../../features/dealers/useDealerSearch";
import { useBooking } from "../../features/booking/BookingContext";
import { DealerCard } from "../../components/DealerCard";

const unique = (values: string[]) => [...new Set(values)].sort();

export function DealerSelect() {
  const { booking, update } = useBooking();
  const navigate = useNavigate();
  const result = useDealerSearch();
  const [prefectureCode, setPrefectureCode] = useState("13");
  const [area, setArea] = useState<DealerArea | "">("");
  const [grade, setGrade] = useState("");
  const [bodyColor, setBodyColor] = useState("");

  useEffect(() => {
    if (!booking.model) return;
    update({ dealer: null, vehicle: null });
    void result.search({
      modelCode: booking.model.code,
      prefectureCode,
    });
  }, [booking.model, prefectureCode, result.search, update]);

  useEffect(() => {
    if (result.status === "success") update({ offline: result.offline });
  }, [result.status, result.offline, update]);

  const choices = useMemo(
    () => filterDealersByVehicles(result.dealers),
    [result.dealers],
  );
  const grades = useMemo(
    () =>
      unique(
        choices.flatMap((dealer) =>
          dealer.vehicles.map((vehicle) => vehicle.grade),
        ),
      ),
    [choices],
  );
  const bodyColors = useMemo(
    () =>
      unique(
        choices.flatMap((dealer) =>
          dealer.vehicles.map((vehicle) => vehicle.body_color),
        ),
      ),
    [choices],
  );
  const filteredDealers = useMemo(
    () =>
      filterDealersByVehicles(result.dealers, {
        area,
        grade,
        bodyColor,
      }),
    [area, bodyColor, grade, result.dealers],
  );
  const filteredVehicleCount = filteredDealers.reduce(
    (total, dealer) => total + dealer.vehicles.length,
    0,
  );
  const areaCounts = useMemo(
    () =>
      countDealerVehiclesByArea(result.dealers, {
        grade,
        bodyColor,
      }),
    [bodyColor, grade, result.dealers],
  );
  const activeFilters =
    Number(Boolean(area)) + Number(Boolean(grade)) + Number(Boolean(bodyColor));
  const filteredAreaTotal = areaCounts.reduce(
    (total, { count }) => total + count,
    0,
  );

  useEffect(() => {
    if (
      booking.vehicle &&
      !filteredDealers.some((dealer) =>
        dealer.vehicles.some(
          (vehicle) => vehicle.id === booking.vehicle?.id,
        ),
      )
    ) {
      update({ dealer: null, vehicle: null });
    }
  }, [booking.vehicle, filteredDealers, update]);

  const clearFilters = () => {
    setArea("");
    setGrade("");
    setBodyColor("");
  };

  return (
    <section>
      <div className="ds-stack">
        <div className="flex items-center gap-sm">
          <Tag>A-3</Tag>
          <p className="text-body-sm">自由に絞り込む</p>
        </div>
        <SectionHeading required>試乗する車両と販売店を選ぶ</SectionHeading>
        <p className="ds-selected-model">
          選択中のモデル：{booking.model?.name}
        </p>
        <p className="ds-hint">
          エリア・グレード・ボディカラーを組み合わせて、乗りたい試乗車を探せます。
        </p>
      </div>

      <div className="ds-dealer-info-grid mt-section items-start">
        <aside className="min-w-0">
          <Accordion
            title="絞り込み条件"
            summary={
              <p className="ds-hint">
                {activeFilters
                  ? `${activeFilters}件の条件を適用中`
                  : "都道府県・エリア・グレード・色で絞り込む"}
              </p>
            }
            defaultOpen
          >
            <div className="ds-stack p-lg">
              <Select
                label="都道府県"
                required
                value={prefectureCode}
                onChange={(event) => {
                  setPrefectureCode(event.target.value);
                  setArea("");
                  update({ dealer: null, vehicle: null });
                }}
              >
                {prefectures.map((prefecture) => (
                  <option key={prefecture.code} value={prefecture.code}>
                    {prefecture.name}
                  </option>
                ))}
              </Select>
              <div className="ds-stack">
                <p className="text-body-sm">エリア</p>
                <div className="ds-row">
                  <Button
                    size="md"
                    variant={area === "" ? "primary" : "secondary"}
                    aria-pressed={area === ""}
                    onClick={() => setArea("")}
                  >
                    すべて {filteredAreaTotal}台
                  </Button>
                  {areaCounts.map(({ area: value, count }) => (
                    <Button
                      key={value}
                      size="md"
                      variant={area === value ? "primary" : "secondary"}
                      aria-pressed={area === value}
                      onClick={() => setArea(value)}
                    >
                      {value} {count}台
                    </Button>
                  ))}
                </div>
              </div>
              <Select
                label="グレード"
                value={grade}
                disabled={result.status !== "success" || grades.length === 0}
                onChange={(event) => setGrade(event.target.value)}
              >
                <option value="">指定しない</option>
                {grades.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </Select>
              <Select
                label="ボディカラー"
                value={bodyColor}
                disabled={result.status !== "success" || bodyColors.length === 0}
                onChange={(event) => setBodyColor(event.target.value)}
              >
                <option value="">指定しない</option>
                {bodyColors.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </Select>
              <TextButton
                disabled={activeFilters === 0}
                onClick={clearFilters}
              >
                絞り込み条件をクリア
              </TextButton>
            </div>
          </Accordion>
        </aside>

        <div
          className="min-w-0"
          aria-live="polite"
          aria-busy={result.status === "loading"}
        >
          <div className="mb-lg flex items-end justify-between gap-md">
            <div>
              <p className="text-sub-title">試乗車一覧</p>
              <p className="ds-hint">
                {result.status === "success"
                  ? `${filteredDealers.length}店舗・試乗車${filteredVehicleCount}台`
                  : "条件に合う試乗車を確認しています"}
              </p>
            </div>
            {activeFilters > 0 && (
              <Tag variant="weak">{activeFilters}条件</Tag>
            )}
          </div>

          {result.status === "loading" && (
            <div className="ds-stack">
              <p>
                <Spinner /> 試乗車情報を更新しています…
              </p>
              <Skeleton />
              <Skeleton />
            </div>
          )}

          {result.message && (
            <Notice variant={result.status === "error" ? "error" : "info"}>
              {result.message}
            </Notice>
          )}

          {result.status === "error" && (
            <Button
              variant="secondary"
              onClick={() =>
                void result.search({
                  modelCode: booking.model!.code,
                  prefectureCode,
                })
              }
            >
              もう一度読み込む
            </Button>
          )}

          {result.status === "success" &&
            (filteredDealers.length === 0 ? (
              <EmptyState title="条件に合う試乗車が見つかりませんでした。">
                <span className="block">
                  エリア、グレードまたはボディカラーを解除して、もう一度お探しください。
                </span>
                <Button
                  className="mt-lg"
                  variant="secondary"
                  disabled={activeFilters === 0}
                  onClick={clearFilters}
                >
                  絞り込み条件を解除する
                </Button>
              </EmptyState>
            ) : (
              <div className="grid gap-md">
                {filteredDealers.map((dealer) => (
                  <DealerCard
                    key={dealer.id}
                    dealer={dealer}
                    variant="vehicle-list"
                    selectedVehicleId={booking.vehicle?.id}
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
            ))}
        </div>
      </div>

      <div className="ds-actions">
        <Button variant="secondary" onClick={() => navigate("/")}>
          戻る
        </Button>
        <Button
          disabled={!booking.vehicle || result.status === "loading"}
          onClick={() => navigate("/information")}
        >
          選択した店舗で次へ →
        </Button>
      </div>
    </section>
  );
}
