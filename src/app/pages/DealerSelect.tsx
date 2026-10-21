import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import prefectures from "../../data/seed/prefectures.json";
import { DealerCard } from "../../components/DealerCard";
import { useDealerSearch } from "../../features/dealers/useDealerSearch";
import { useBooking } from "../../features/booking/BookingContext";
export function DealerSelect() {
  const { booking, update } = useBooking();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"prefecture" | "postal">("prefecture");
  const [pref, setPref] = useState("");
  const [postal, setPostal] = useState("");
  const result = useDealerSearch();
  useEffect(() => {
    if (result.status === "success") update({ offline: result.offline });
  }, [result.status, result.offline, update]);
  const clear = () => {
    result.reset();
    update({ dealer: null });
  };
  return (
    <section>
      <h2 className="text-xl mb-3">ご希望の販売店をお選びください</h2>
      <p className="text-sm text-muted mb-8">
        選択中のモデル：
        <strong className="text-ink">{booking.model?.name}</strong>
      </p>
      <div className="panel">
        <div
          className="flex border-b border-line mb-6"
          role="tablist"
          aria-label="検索方法"
        >
          {(["prefecture", "postal"] as const).map((t) => (
            <button
              key={t}
              id={`tab-${t}`}
              aria-controls="search-panel"
              role="tab"
              aria-selected={tab === t}
              className={`flex-1 p-4 text-sm border-b ${tab === t ? "border-ink text-ink" : "border-line text-muted"}`}
              onClick={() => {
                setTab(t);
                clear();
              }}
            >
              {t === "prefecture" ? "都道府県から検索" : "郵便番号から検索"}
            </button>
          ))}
        </div>
        <form
          id="search-panel"
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
          onSubmit={(e) => {
            e.preventDefault();
            update({ dealer: null });
            void result.search({
              modelCode: booking.model!.code,
              ...(tab === "prefecture"
                ? { prefectureCode: pref }
                : { postalCode: postal }),
            });
          }}
          className="flex flex-col md:flex-row items-end gap-4"
        >
          {tab === "prefecture" ? (
            <label className="field flex-1 w-full">
              <span>都道府県</span>
              <select
                required
                value={pref}
                onChange={(e) => {
                  setPref(e.target.value);
                  clear();
                }}
              >
                <option value="">お選びください</option>
                {prefectures.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="field flex-1 w-full">
              <span>郵便番号</span>
              <input
                required
                inputMode="numeric"
                autoComplete="postal-code"
                pattern="[0-9]{3}-?[0-9]{4}"
                placeholder="例：1000001"
                value={postal}
                onChange={(e) => {
                  setPostal(e.target.value);
                  clear();
                }}
              />
            </label>
          )}
          <button className="primary" disabled={result.status === "loading"}>
            販売店を検索
          </button>
        </form>
      </div>
      <div
        className="mt-8"
        aria-live="polite"
        aria-busy={result.status === "loading"}
      >
        {result.status === "loading" && (
          <div className="panel text-center py-12">
            <p>販売店情報を読み込んでいます…</p>
            <p className="text-sm text-muted mt-2">しばらくお待ちください。</p>
          </div>
        )}
        {result.message && (
          <p
            role={result.status === "error" ? "alert" : "status"}
            className={`p-4 mb-6 text-sm ${result.status === "error" ? "text-danger bg-white" : "text-muted bg-surface"}`}
          >
            {result.message}
          </p>
        )}
        {result.status === "success" && (
          <>
            <p className="text-sm mb-5">
              検索結果{" "}
              <strong className="text-xl">{result.dealers.length}</strong> 件
            </p>
            {result.dealers.length === 0 ? (
              <div className="panel">
                <p>該当する販売店が見つかりませんでした。</p>
                <p className="text-sm text-muted mt-2">
                  検索条件を変更して、もう一度お試しください。
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {result.dealers.map((dealer) => (
                  <DealerCard
                    key={dealer.id}
                    dealer={dealer}
                    selected={booking.dealer?.id === dealer.id}
                    onSelect={(d) =>
                      update({ dealer: d, offline: result.offline })
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex justify-between gap-4 border-t border-line pt-6 mt-10">
        <Link className="secondary" to="/">
          戻る
        </Link>
        <button
          className="primary"
          disabled={!booking.dealer || result.status === "loading"}
          onClick={() => navigate("/information")}
        >
          情報の入力へ →
        </button>
      </div>
    </section>
  );
}
