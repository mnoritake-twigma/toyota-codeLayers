import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
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
import prefectures from "../../data/seed/prefectures.json";
import { useDealerSearch } from "../../features/dealers/useDealerSearch";
import { useBooking } from "../../features/booking/BookingContext";
import type { DealerResult, DealerVehicle } from "../../types";
import { vehicleResults } from "../../features/dealers/vehicleResults";
import { groupDealers } from "../../features/dealers/sortDealers";

export function DealerSelect() {
  const { booking, update } = useBooking();
  const navigate = useNavigate();
  const result = useDealerSearch();
  const [prefectureCode, setPrefectureCode] = useState("13");
  const [grade, setGrade] = useState("");
  const [bodyColor, setBodyColor] = useState("");
  const [revealCards, setRevealCards] = useState(true);

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

  useEffect(() => {
    if (result.status !== "success" || !revealCards) return;
    const timer = window.setTimeout(() => setRevealCards(false), 3600);
    return () => window.clearTimeout(timer);
  }, [result.status, revealCards]);

  const { grades, bodyColors, filters, filteredChoices } = useMemo(
    () => vehicleResults(result.dealers, { grade, bodyColor }),
    [result.dealers, grade, bodyColor]
  );
  const telephoneDealers = useMemo(
    () => groupDealers(result.dealers).telephone,
    [result.dealers]
  );
  const activeVehicleFilters =
    Number(Boolean(filters.grade)) + Number(Boolean(filters.bodyColor));
  const activeFilters = activeVehicleFilters;
  const selectedChoice = filteredChoices.some(
    ({ dealer, vehicle }) =>
      dealer.id === booking.dealer?.id && vehicle.id === booking.vehicle?.id
  );

  useEffect(() => {
    if (booking.vehicle && !selectedChoice) {
      update({ dealer: null, vehicle: null });
    }
  }, [booking.vehicle, selectedChoice, update]);

  const clearVehicleFilters = () => {
    setGrade("");
    setBodyColor("");
  };

  return (
    <section>
      <div className="ds-stack">
        <div className="flex items-center gap-sm">
          <Tag>A-3 早期リリース版</Tag>
          <p className="text-body-sm">自由に絞り込む</p>
        </div>
        <SectionHeading required>試乗する車両と販売店を選ぶ</SectionHeading>
        <p className="ds-selected-model">
          選択中のモデル：{booking.model?.name}
        </p>
        <p className="ds-hint">
          都道府県・グレード・ボディカラーを組み合わせて、乗りたい試乗車を探せます。
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
                  : "都道府県・グレード・色で絞り込む"}
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
                  clearVehicleFilters();
                  update({ dealer: null, vehicle: null });
                }}
              >
                {prefectures.map((prefecture) => (
                  <option key={prefecture.code} value={prefecture.code}>
                    {prefecture.name}
                  </option>
                ))}
              </Select>
              <p className="ds-hint">
                グレード・ボディカラーの候補は、取得済みの登録試乗車から表示しています。
              </p>
              <Select
                label="グレード"
                value={filters.grade}
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
                value={filters.bodyColor}
                disabled={
                  result.status !== "success" || bodyColors.length === 0
                }
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
                  ? `表示中 ${filteredChoices.length}台`
                  : result.status === "error"
                  ? "試乗車情報を取得できませんでした"
                  : "条件に合う試乗車を確認しています"}
              </p>
              <p className="ds-hint">
                取得済みの登録試乗車を表示しています。希望日時の空き状況ではありません。
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
              <div className="ds-stack">
                <EmptyState title="取得済みの情報に、条件に合う登録試乗車はありません。">
                  {activeVehicleFilters > 0
                    ? "グレードまたはボディカラーを解除して、もう一度お探しください。"
                    : "都道府県を変更するか、下の販売店へお問い合わせください。"}
                </EmptyState>
                {activeVehicleFilters > 0 && (
                  <Button variant="secondary" onClick={clearVehicleFilters}>
                    車両条件を解除する
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-md">
                {filteredChoices.map(({ dealer, vehicle }, index) => (
                  <VehicleCard
                    key={vehicle.id}
                    dealer={dealer}
                    vehicle={vehicle}
                    index={index}
                    animateOnLoad={revealCards}
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
          {result.status === "success" && telephoneDealers.length > 0 && (
            <div className="ds-stack mt-section">
              <SectionHeading>電話で問い合わせする</SectionHeading>
              <p className="ds-hint">
                下記の販売店には、選択中モデルの試乗車の登録がありません。
                試乗車をご用意できる場合がありますので、販売店へお問い合わせください。
              </p>
              {telephoneDealers.map((dealer) => (
                <article className="ds-phone-card" key={dealer.id}>
                  <h3>{dealer.name}</h3>
                  <DescriptionList
                    items={[
                      { label: "住所", value: dealer.address },
                      { label: "定休日", value: dealer.closed_days },
                      { label: "営業時間", value: dealer.business_hours },
                      {
                        label: "電話番号",
                        value: (
                          <a href={`tel:${dealer.phone}`}>{dealer.phone}</a>
                        ),
                      },
                    ]}
                  />
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="ds-actions">
        <Button variant="secondary" onClick={() => navigate("/")}>
          戻る
        </Button>
        <Button
          disabled={!selectedChoice || result.status !== "success"}
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
  animateOnLoad,
  selected,
  onSelect,
}: {
  dealer: DealerResult;
  vehicle: DealerVehicle;
  index: number;
  animateOnLoad: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (
      !card ||
      !animateOnLoad ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const fadeStart = Math.min(index, 32) / 36;
    const fadeEnd = Math.min(index + 4, 36) / 36;
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
      { duration: 3600, iterations: 1, fill: "both" }
    );

    return () => animation.cancel();
  }, [animateOnLoad, index]);

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
          <div className="mt-md">
            <DescriptionList
              items={[
                { label: "グレード", value: vehicle.grade },
                { label: "ボディカラー", value: vehicle.body_color },
                { label: "インテリアカラー", value: vehicle.interior_color },
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
