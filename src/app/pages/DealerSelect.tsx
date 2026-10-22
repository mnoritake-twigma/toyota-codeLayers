import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  Button,
  DescriptionList,
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
  filterDealerVehicles,
  groupDealers,
  groupVehicleChoices,
  normalizeVehicleFilters,
  vehicleFilterOptions,
} from "../../features/dealers/sortDealers";
import { useDealerSearch } from "../../features/dealers/useDealerSearch";
import { useModelPhoto } from "../../features/dealers/useModelPhoto";
import { useBooking } from "../../features/booking/BookingContext";
import { DealerVehicleCard } from "../../components/DealerVehicleCard";

export function DealerSelect() {
  const { booking, update } = useBooking();
  const navigate = useNavigate();
  const result = useDealerSearch();
  const [prefectureCode, setPrefectureCode] = useState("13");
  const [grade, setGrade] = useState("");
  const [bodyColor, setBodyColor] = useState("");
  const modelPhotoUrl = useModelPhoto(booking.model!.code);

  useEffect(() => {
    if (!booking.model) return;
    update({ dealer: null, vehicle: null, offline: false });
    void result.search({ modelCode: booking.model.code, prefectureCode });
  }, [booking.model, prefectureCode, result.search, update]);

  const { grades, bodyColors } = useMemo(
    () => vehicleFilterOptions(result.dealers),
    [result.dealers],
  );
  const filters = useMemo(
    () => normalizeVehicleFilters(result.dealers, { grade, bodyColor }),
    [result.dealers, grade, bodyColor],
  );
  useEffect(() => {
    if (result.status === "success") {
      setGrade(filters.grade);
      setBodyColor(filters.bodyColor);
    }
  }, [result.status, filters]);
  const filteredChoices = useMemo(
    () => filterDealerVehicles(result.dealers, filters),
    [result.dealers, filters],
  );
  const visibleDealers = useMemo(
    () => groupVehicleChoices(filteredChoices),
    [filteredChoices],
  );
  const telephoneDealers = useMemo(
    () => groupDealers(result.dealers).telephone,
    [result.dealers],
  );
  const activeFilters =
    Number(Boolean(filters.grade)) + Number(Boolean(filters.bodyColor));
  const canContinue =
    result.status === "success" &&
    !result.offline &&
    filteredChoices.some(
      ({ dealer, vehicle }) =>
        vehicle.id === booking.vehicle?.id && dealer.id === booking.dealer?.id,
    );

  useEffect(() => {
    if (booking.vehicle && !canContinue)
      update({ dealer: null, vehicle: null });
  }, [booking.vehicle, canContinue, update]);

  const clearFilters = () => {
    setGrade("");
    setBodyColor("");
  };
  const retry = () => {
    clearFilters();
    update({ dealer: null, vehicle: null, offline: false });
    void result.search({ modelCode: booking.model!.code, prefectureCode });
  };
  const prefectureName = prefectures.find(
    (p) => p.code === prefectureCode,
  )?.name;

  return (
    <section>
      <div className="ds-stack">
        <div className="flex flex-wrap items-center gap-sm">
          <Tag>A-3</Tag>
          <p className="text-body-sm">早期リリース版（バックエンド変更なし）</p>
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
                  ? `${activeFilters}件の車両条件を適用中`
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
                  result.reset();
                  clearFilters();
                  update({ dealer: null, vehicle: null, offline: false });
                  setPrefectureCode(event.target.value);
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
              <p className="ds-hint">
                候補は、この都道府県で取得できた登録車両の情報です。
              </p>
              <TextButton disabled={activeFilters === 0} onClick={clearFilters}>
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
          <div className="mb-lg flex flex-wrap items-start justify-between gap-sm">
            <div>
              <h3 className="text-sub-title">試乗車一覧</h3>
              {result.status === "success" && (
                <p className="ds-hint">
                  表示中 {visibleDealers.length}店舗・試乗車
                  {filteredChoices.length}台
                </p>
              )}
            </div>
            <div className="min-w-0 text-caption text-text-secondary">
              <p>都道府県：{prefectureName}</p>
              {result.status === "success" && (
                <>
                  <p>グレード：{filters.grade || "指定しない"}</p>
                  <p>ボディカラー：{filters.bodyColor || "指定しない"}</p>
                </>
              )}
            </div>
          </div>
          {result.status === "idle" && (
            <p className="ds-hint">販売店情報を取得します。</p>
          )}
          {result.status === "loading" && (
            <div className="ds-stack">
              <p>
                <Spinner /> 試乗車情報を更新しています…
              </p>
              <Skeleton />
              <Skeleton />
            </div>
          )}
          {result.status === "error" && (
            <div className="ds-stack">
              <Notice variant="error">{result.message}</Notice>
              <Button variant="secondary" onClick={retry}>
                もう一度読み込む
              </Button>
            </div>
          )}
          {result.status === "success" && (
            <>
              {filteredChoices.length === 0 ? (
                <EmptyState
                  title={
                    activeFilters
                      ? "条件に合う試乗車が見つかりませんでした。"
                      : "この都道府県には、選択中のモデルの登録試乗車がありません。"
                  }
                >
                  {activeFilters ? (
                    <>
                      <p>
                        グレードまたはボディカラーを解除して、もう一度お探しください。
                      </p>
                      <Button
                        className="mt-lg"
                        variant="secondary"
                        onClick={clearFilters}
                      >
                        車両条件を解除する
                      </Button>
                    </>
                  ) : (
                    <p>都道府県を変更してお探しください。</p>
                  )}
                </EmptyState>
              ) : (
                <div className="grid gap-md">
                  {visibleDealers.map((dealer) => (
                    <DealerVehicleCard
                      key={dealer.id}
                      dealer={dealer}
                      modelPhotoUrl={modelPhotoUrl}
                      selectedVehicleId={booking.vehicle?.id}
                      onSelect={(selectedDealer, selectedVehicle) =>
                        update({
                          dealer: selectedDealer,
                          vehicle: selectedVehicle,
                          offline: false,
                        })
                      }
                    />
                  ))}
                </div>
              )}
              {telephoneDealers.length > 0 && (
                <div className="ds-stack mt-section">
                  <h3 className="text-sub-title">電話で問い合わせする</h3>
                  <p className="ds-hint">
                    選択中のモデルの試乗車が登録されていない店舗です。事前にご連絡いただければ、ご用意できる場合があります。
                  </p>
                  {telephoneDealers.map((dealer) => (
                    <article className="ds-phone-card" key={dealer.id}>
                      <h4 className="text-body">{dealer.name}</h4>
                      <DescriptionList
                        items={[
                          { label: "住所", value: dealer.address },
                          { label: "営業時間", value: dealer.business_hours },
                          { label: "定休日", value: dealer.closed_days },
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
            </>
          )}
        </div>
      </div>
      <div className="ds-actions">
        <Button variant="secondary" onClick={() => navigate("/")}>
          戻る
        </Button>
        <Button
          disabled={!canContinue}
          onClick={() => navigate("/information")}
        >
          選択した店舗で次へ →
        </Button>
      </div>
    </section>
  );
}
