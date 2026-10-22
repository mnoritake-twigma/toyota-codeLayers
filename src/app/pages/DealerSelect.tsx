import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Band,
  Button,
  EmptyState,
  Notice,
  SectionHeading,
  Select,
  Skeleton,
  Spinner,
  Tabs,
  TextField,
  DescriptionList,
} from "../../ds";
import { groupDealers } from "../../features/dealers/sortDealers";
import prefectures from "../../data/seed/prefectures.json";
import { DealerCard } from "../../components/DealerCard";
import { useDealerSearch } from "../../features/dealers/useDealerSearch";
import { useBooking } from "../../features/booking/BookingContext";
export function DealerSelect() {
  const { booking, update } = useBooking();
  const navigate = useNavigate();
  const [tab, setTab] = useState("prefecture");
  const [pref, setPref] = useState("");
  const [postal, setPostal] = useState("");
  const result = useDealerSearch();
  const groups = groupDealers(result.dealers);
  useEffect(() => {
    if (result.status === "success") update({ offline: result.offline });
  }, [result.status, result.offline, update]);
  const clear = () => {
    result.reset();
    update({ dealer: null, vehicle: null });
  };
  return (
    <section>
      <SectionHeading required>ご希望の販売店をお選びください</SectionHeading>
      <p className="ds-selected-model">選択中のモデル：{booking.model?.name}</p>
      <Tabs
        label="検索方法"
        panelId="search-panel"
        items={[
          { value: "prefecture", label: "都道府県から検索" },
          { value: "postal", label: "郵便番号から検索" },
        ]}
        value={tab}
        onChange={(v) => {
          setTab(v);
          clear();
        }}
      />
      <form
        id="search-panel"
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        className="ds-stack"
        onSubmit={(e) => {
          e.preventDefault();
          update({ dealer: null, vehicle: null });
          void result.search({
            modelCode: booking.model!.code,
            ...(tab === "prefecture"
              ? { prefectureCode: pref }
              : { postalCode: postal }),
          });
        }}
      >
        {tab === "prefecture" ? (
          <Select
            label="都道府県"
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
          </Select>
        ) : (
          <TextField
            label="郵便番号"
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
        )}
        <Button loading={result.status === "loading"}>販売店を検索</Button>
        {tab === "prefecture" && (
          <p className="ds-hint">選択した都道府県内の販売店を表示します。</p>
        )}
      </form>
      <div aria-live="polite" aria-busy={result.status === "loading"}>
        {result.status === "loading" && (
          <Band>
            <Spinner />
            <p>販売店情報を読み込んでいます…</p>
            <Skeleton />
          </Band>
        )}
        {result.message && (
          <Notice variant={result.status === "error" ? "error" : "info"}>
            {result.message}
          </Notice>
        )}
        {result.status === "success" && (
          <Band>
            <p>検索結果 {result.dealers.length} 件</p>
            {result.dealers.length === 0 ? (
              <EmptyState title="該当する販売店が見つかりませんでした。">
                検索条件を変更して、もう一度お試しください。
              </EmptyState>
            ) : (
              <>
                <div className="ds-dealer-list">
                  {groups.registered.map((dealer) => (
                    <DealerCard
                      key={dealer.id}
                      dealer={dealer}
                      selectedVehicleId={booking.vehicle?.id}
                      onSelect={(d, v) =>
                        update({
                          dealer: d,
                          vehicle: v,
                          offline: result.offline,
                        })
                      }
                    />
                  ))}
                </div>
                {groups.telephone.length > 0 && (
                  <>
                    <SectionHeading>電話で問い合わせする</SectionHeading>
                    <p className="ds-hint">
                      下記の店舗には、ご希望のモデルの試乗車の登録がございませんが、事前にご連絡いただければ、試乗車をご用意できる場合がございます。お気軽に店舗までお問い合わせください。
                    </p>
                    <div className="ds-dealer-list">
                      {groups.telephone.map((d) => (
                        <article className="ds-phone-card" key={d.id}>
                          <h3>{d.name}</h3>
                          <DescriptionList
                            items={[
                              { label: "住所", value: d.address },
                              { label: "定休日", value: d.closed_days },
                              { label: "営業時間", value: d.business_hours },
                              {
                                label: "電話番号",
                                value: <a href={`tel:${d.phone}`}>{d.phone}</a>,
                              },
                            ]}
                          />
                        </article>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </Band>
        )}
      </div>
      <div className="ds-actions">
        <Button variant="secondary" onClick={() => navigate("/")}>
          戻る
        </Button>
        <Button
          disabled={!booking.vehicle || result.status === "loading"}
          onClick={() => navigate("/information")}
        >
          情報の入力へ →
        </Button>
      </div>
    </section>
  );
}
