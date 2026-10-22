import { useEffect, useMemo, useRef, useState } from "react";
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
import { dealerVehicleImage } from "../../assets/images";
import prefectures from "../../data/seed/prefectures.json";
import { useDealerSearch } from "../../features/dealers/useDealerSearch";
import { useBooking } from "../../features/booking/BookingContext";
import type { DealerResult, DealerVehicle } from "../../types";

const unique = (values: string[]) => [...new Set(values)].sort();
const areas = ["月白町", "朝凪町", "星見町"] as const;
type Area = (typeof areas)[number] | "その他";

const areaFor = (address: string): Area => {
  const normalized = address.replaceAll(" ", "").replaceAll("／", "");
  return areas.find((area) => normalized.includes(area)) ?? "その他";
};

export function DealerSelect() {
  const { booking, update } = useBooking();
  const navigate = useNavigate();
  const result = useDealerSearch();
  const [prefectureCode, setPrefectureCode] = useState("13");
  const [area, setArea] = useState<Area | "">("");
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
  const vehicleFilteredChoices = useMemo(
    () =>
      choices.filter(
        ({ vehicle }) =>
          (!grade || vehicle.grade === grade) &&
          (!bodyColor || vehicle.body_color === bodyColor),
      ),
    [bodyColor, choices, grade],
  );
  const filteredChoices = useMemo(
    () =>
      vehicleFilteredChoices.filter(
        ({ dealer }) => !area || areaFor(dealer.address) === area,
      ),
    [area, vehicleFilteredChoices],
  );
  const areaChoices = useMemo(
    () =>
      (["", ...areas, "その他"] as const).map((value) => ({
        value,
        label: value || "すべて",
        count: vehicleFilteredChoices.filter(
          ({ dealer }) => !value || areaFor(dealer.address) === value,
        ).length,
      })),
    [vehicleFilteredChoices],
  );
  const activeVehicleFilters = Number(Boolean(grade)) + Number(Boolean(bodyColor));
  const activeFilters = Number(Boolean(area)) + activeVehicleFilters;

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
                <div className="flex flex-wrap gap-xs" role="group" aria-label="エリア">
                  {areaChoices.map((choice) => (
                    <Button
                      key={choice.label}
                      variant={area === choice.value ? "primary" : "secondary"}
                      className="h-auto min-w-0 px-tag-x py-tag-y text-tag"
                      aria-pressed={area === choice.value}
                      onClick={() => {
                        setArea(choice.value);
                        update({ dealer: null, vehicle: null });
                      }}
                    >
                      {choice.label} {choice.count}
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
            {activeFilters > 0 && <Tag variant="weak">{activeFilters}条件</Tag>}
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
                {filteredChoices.map(({ dealer, vehicle }, index) => (
                  <VehicleCard
                    key={vehicle.id}
                    dealer={dealer}
                    vehicle={vehicle}
                    index={index}
                    animationKey={`${prefectureCode}:${area}:${grade}:${bodyColor}`}
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
  index,
  animationKey,
  selected,
  onSelect,
}: {
  dealer: DealerResult;
  vehicle: DealerVehicle;
  index: number;
  animationKey: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (
      !card ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const fadeStart = index / 36;
    const fadeEnd = (index + 4) / 36;
    const animation = card.animate(
      index === 0
        ? [
            { opacity: 0, offset: 0, easing: "ease-out" },
            { opacity: 1, offset: fadeEnd },
            { opacity: 1, offset: 1 },
          ]
        : [
            { opacity: 0, offset: 0 },
            {
              opacity: 0,
              offset: fadeStart,
              easing: "ease-out",
            },
            {
              opacity: 1,
              offset: fadeEnd,
              easing: "cubic-bezier(0.5, 0, 0.5, 1)",
            },
            { opacity: 1, offset: 1 },
          ],
      { duration: 3600, iterations: 1, fill: "both" },
    );

    return () => animation.cancel();
  }, [animationKey, index]);

  return (
    <article ref={cardRef}>
      <RadioCard
        name="test-drive-vehicle"
        value={vehicle.id}
        selected={selected}
        onSelect={onSelect}
      >
        <div className="min-w-0">
          <p className="mb-md">{dealer.name}</p>
          <AssetImage
            src={dealerVehicleImage(vehicle.id)}
            alt={`${dealer.name}：AI生成の架空店舗イメージ`}
            variant="dealer-cover"
          />
          <div className="mt-md">
            <DescriptionList
              items={[
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
