import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AssetImage,
  Button,
  DescriptionList,
  EmptyState,
  Notice,
  RadioCard,
  SectionHeading,
  Select,
  Skeleton,
  Spinner,
  Tag,
  TextButton,
} from "../../ds";
import { modelImage } from "../../assets/images";
import prefectures from "../../data/seed/prefectures.json";
import { useDealerSearch } from "../../features/dealers/useDealerSearch";
import { useBooking } from "../../features/booking/BookingContext";
import type { DealerResult, DealerVehicle } from "../../types";

const unique = (values: string[]) => [...new Set(values)].sort();

export function DealerSelect() {
  const { booking, update } = useBooking();
  const navigate = useNavigate();
  const result = useDealerSearch();
  const [prefectureCode, setPrefectureCode] = useState("13");
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
    () =>
      result.dealers.flatMap((dealer) =>
        dealer.vehicles.map((vehicle) => ({ dealer, vehicle })),
      ),
    [result.dealers],
  );
  const grades = useMemo(
    () => unique(choices.map(({ vehicle }) => vehicle.grade)),
    [choices],
  );
  const bodyColors = useMemo(
    () => unique(choices.map(({ vehicle }) => vehicle.body_color)),
    [choices],
  );
  const filteredChoices = useMemo(
    () =>
      choices.filter(
        ({ vehicle }) =>
          (!grade || vehicle.grade === grade) &&
          (!bodyColor || vehicle.body_color === bodyColor),
      ),
    [bodyColor, choices, grade],
  );
  const activeVehicleFilters = Number(Boolean(grade)) + Number(Boolean(bodyColor));

  useEffect(() => {
    if (
      booking.vehicle &&
      !filteredChoices.some(
        ({ vehicle }) => vehicle.id === booking.vehicle?.id,
      )
    ) {
      update({ dealer: null, vehicle: null });
    }
  }, [booking.vehicle, filteredChoices, update]);

  const clearVehicleFilters = () => {
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
                {activeVehicleFilters
                  ? `${activeVehicleFilters}件の車両条件を適用中`
                  : "エリア・グレード・色で絞り込む"}
              </p>
            }
            defaultOpen
          >
            <div className="ds-stack p-lg">
              <Select
                label="エリア"
                required
                value={prefectureCode}
                onChange={(event) => {
                  setPrefectureCode(event.target.value);
                  update({ dealer: null, vehicle: null });
                }}
              >
                {prefectures.map((prefecture) => (
                  <option key={prefecture.code} value={prefecture.code}>
                    {prefecture.name}
                  </option>
                ))}
              </Select>
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
                disabled={activeVehicleFilters === 0}
                onClick={clearVehicleFilters}
              >
                車両条件をクリア
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
                  ? `${filteredChoices.length}台の試乗車`
                  : "条件に合う試乗車を確認しています"}
              </p>
            </div>
            {activeVehicleFilters > 0 && (
              <Tag variant="weak">{activeVehicleFilters}条件</Tag>
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
            (filteredChoices.length === 0 ? (
              <EmptyState title="条件に合う試乗車が見つかりませんでした。">
                <span className="block">
                  グレードまたはボディカラーを解除して、もう一度お探しください。
                </span>
                <Button
                  className="mt-lg"
                  variant="secondary"
                  disabled={activeVehicleFilters === 0}
                  onClick={clearVehicleFilters}
                >
                  車両条件を解除する
                </Button>
              </EmptyState>
            ) : (
              <div className="grid gap-md">
                {filteredChoices.map(({ dealer, vehicle }) => (
                  <VehicleCard
                    key={vehicle.id}
                    dealer={dealer}
                    vehicle={vehicle}
                    modelCode={booking.model!.code}
                    selected={booking.vehicle?.id === vehicle.id}
                    onSelect={() =>
                      update({
                        dealer,
                        vehicle,
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

function VehicleCard({
  dealer,
  vehicle,
  modelCode,
  selected,
  onSelect,
}: {
  dealer: DealerResult;
  vehicle: DealerVehicle;
  modelCode: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <article>
      <RadioCard
        name="test-drive-vehicle"
        value={vehicle.id}
        selected={selected}
        onSelect={onSelect}
      >
        <div className="ds-dealer-summary">
          <div className="w-thumbnail-width shrink-0">
            <AssetImage
              src={modelImage(modelCode)}
              alt="AI生成の架空車両イメージ"
              variant="model"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-sm flex flex-wrap items-center gap-xs">
              <Tag variant={selected ? "dark" : "weak"}>
                {selected ? "選択中" : "試乗車"}
              </Tag>
              <p>{vehicle.grade}</p>
            </div>
            <DescriptionList
              items={[
                { label: "ボディカラー", value: vehicle.body_color },
                { label: "内装色", value: vehicle.interior_color },
                { label: "販売店", value: dealer.name },
                { label: "住所", value: dealer.address },
                {
                  label: "営業情報",
                  value: `${dealer.business_hours}／定休日 ${dealer.closed_days}`,
                },
              ]}
            />
          </div>
        </div>
      </RadioCard>
    </article>
  );
}
