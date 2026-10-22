import { VehicleTable } from "../../components/VehicleTable";
import type { DealerVehicle } from "../../types";
import { modelImage, dealerImage } from "../../assets/images";
import { useState } from "react";
import * as DS from "../../ds";
import tokens from "../../ds/tokens/tokens.json";
export function Catalog() {
  const [tab, setTab] = useState("prefecture");
  const [radio, setRadio] = useState("one");
  const [sampleSelection, setSampleSelection] = useState("catalog-2");
  const sampleVehicles: DealerVehicle[] = [
    {
      id: "catalog-1",
      dealer_id: "catalog",
      model_code: "M01",
      grade: "静風",
      body_color: "月霧ホワイト",
      interior_color: "砂音ベージュ",
    },
    {
      id: "catalog-2",
      dealer_id: "catalog",
      model_code: "M01",
      grade: "月澄",
      body_color: "夜凪ブラック",
      interior_color: "墨影ブラック",
    },
  ];
  const [date, setDate] = useState("");
  return (
    <div className="ds-stack">
      <h1 className="ds-title">LUMIÈRE DS</h1>
      <p>
        コードを正本とするデザインシステム。各操作はキーボードでもお試しいただけます。
      </p>
      <DS.SectionHeading>トークン</DS.SectionHeading>
      <div className="ds-grid">
        {Object.keys(tokens.semantic.color).map((name) => (
          <div key={name} className="ds-token-item">
            <span className={`ds-swatch ds-swatch--${name}`} />
            <small>{name}</small>
          </div>
        ))}
      </div>
      <div className="ds-stack">
        {Object.keys(tokens.semantic.space).map((name) => (
          <div key={name}>
            {name}
            <div className={`ds-space-sample ds-space-sample--${name}`} />
          </div>
        ))}
      </div>
      {Object.keys(tokens.semantic.fontSize).map((name) => (
        <p key={name} className={`ds-type-sample--${name}`}>
          {name}：静けさと、力強さを。
        </p>
      ))}
      <DS.SectionHeading>Button / TextButton</DS.SectionHeading>
      {(["primary", "secondary"] as const).map((variant) => (
        <div className="ds-stack" key={variant}>
          {(["md", "lg"] as const).map((size) => (
            <div className="ds-stack" key={size}>
              <p>
                {variant} / {size}
              </p>
              <div className="ds-row">
                <DS.Button variant={variant} size={size}>
                  通常
                </DS.Button>
                <DS.Button variant={variant} size={size} data-preview="hover">
                  ホバー
                </DS.Button>
                <DS.Button variant={variant} size={size} disabled>
                  無効
                </DS.Button>
                <DS.Button variant={variant} size={size} loading>
                  読み込み中
                </DS.Button>
              </div>
            </div>
          ))}
        </div>
      ))}
      {(["arrow-right", "chevron-left"] as const).map((variant) => (
        <div className="ds-row" key={variant}>
          <DS.TextButton variant={variant}>変更する</DS.TextButton>
          <DS.TextButton variant={variant} data-preview="hover">
            ホバー
          </DS.TextButton>
          <DS.TextButton variant={variant} disabled>
            無効
          </DS.TextButton>
        </div>
      ))}
      <DS.SectionHeading required>フォーム部品</DS.SectionHeading>
      <DS.SectionHeading>必須タグなし</DS.SectionHeading>
      {(["normal", "disabled", "error"] as const).map((state) => (
        <div className="ds-grid" key={state}>
          <DS.TextField
            label={`TextField ${state}`}
            placeholder="お名前"
            required
            disabled={state === "disabled"}
            error={state === "error" ? "入力内容をご確認ください" : undefined}
            hint="補足文です"
          />
          <DS.Textarea
            label={`Textarea ${state}`}
            required
            disabled={state === "disabled"}
            error={state === "error" ? "入力内容をご確認ください" : undefined}
          />
          <DS.Select
            label={`Select ${state}`}
            defaultValue=""
            required
            disabled={state === "disabled"}
            error={state === "error" ? "選択してください" : undefined}
          >
            <option value="">お選びください</option>
            <option>東京都</option>
          </DS.Select>
        </div>
      ))}
      <DS.TextField label="入力済み" defaultValue="デモ 太郎" />
      <DS.Select label="選択済み" value="13" onChange={() => {}}>
        <option value="13">東京都</option>
      </DS.Select>
      <DS.SectionHeading>ホバー・フォーカスの見本</DS.SectionHeading>
      <p className="ds-hint">
        実際の操作に加え、抽出用に状態を固定した見本です。
      </p>
      <div className="ds-preview-hover ds-grid">
        <DS.TextField label="ホバー" placeholder="氏名" />
        <DS.Select label="ホバー" defaultValue="">
          <option value="">お選びください</option>
          <option>東京都</option>
        </DS.Select>
        <DS.Textarea label="ホバー" />
      </div>
      <div className="ds-preview-focus ds-grid">
        <DS.Button>フォーカス</DS.Button>
        <DS.TextField label="フォーカス" />
        <DS.Select label="フォーカス">
          <option>東京都</option>
        </DS.Select>
        <DS.Textarea label="フォーカス" />
      </div>
      <DS.SectionHeading>Tabs / RadioCard</DS.SectionHeading>
      <DS.Tabs
        label="検索方法"
        items={[
          { value: "prefecture", label: "都道府県から検索" },
          { value: "postal", label: "郵便番号から検索" },
          { value: "disabled", label: "無効", disabled: true },
        ]}
        value={tab}
        onChange={setTab}
      />
      <div className="ds-grid">
        {["one", "two", "disabled"].map((v) => (
          <DS.RadioCard
            key={v}
            name="catalog"
            value={v}
            selected={radio === v}
            onSelect={() => setRadio(v)}
            disabled={v === "disabled"}
          >
            {v}
          </DS.RadioCard>
        ))}
      </div>
      <DS.RadioCard
        name="disabled-selected"
        value="selected"
        selected
        disabled
        onSelect={() => {}}
      >
        選択済み・無効
      </DS.RadioCard>
      <div className="ds-row">
        <DS.RadioControl
          name="catalog-radio-control"
          value="normal"
          aria-label="RadioControl 通常"
        />
        <DS.RadioControl
          name="catalog-radio-control"
          value="checked"
          checked
          readOnly
          aria-label="RadioControl 選択中"
        />
        <DS.RadioControl
          name="catalog-radio-control-disabled"
          value="disabled"
          disabled
          aria-label="RadioControl 無効"
        />
      </div>
      <DS.SectionHeading>RadioCard / model</DS.SectionHeading>
      <div className="ds-model-grid">
        {["通常", "選択中", "無効", "選択済み・無効"].map((state, i) => (
          <DS.RadioCard
            key={state}
            variant="model"
            name={`model-preview-${i}`}
            value={state}
            selected={i % 2 === 1}
            disabled={i > 1}
            onSelect={() => {}}
          >
            <DS.AssetImage variant="model" alt="架空モデルのプレースホルダ" />
            <span className="ds-model-details">
              <span className="ds-hint">SUV</span>
              <span className="ds-subtitle">AURA</span>
              <span className="ds-hint">{state}</span>
            </span>
          </DS.RadioCard>
        ))}
      </div>
      <DS.SectionHeading>Tag</DS.SectionHeading>
      <div className="ds-row">
        {(["bright", "weak", "dark"] as const).flatMap((variant) =>
          (["sm", "lg"] as const).map((size) => (
            <DS.Tag key={variant + size} variant={variant} size={size}>
              {variant} / {size}
            </DS.Tag>
          )),
        )}
      </div>
      <DS.SectionHeading>
        Accordion / DataTable / DescriptionList
      </DS.SectionHeading>
      {[false, true].map((open) => (
        <DS.Accordion
          key={String(open)}
          title={open ? "展開状態" : "閉じた状態"}
          defaultOpen={open}
        >
          <VehicleTable
            vehicle={sampleVehicles[open ? 1 : 0]}
            distanceKm={open ? 2.8 : 1.4}
          />
        </DS.Accordion>
      ))}
      <DS.SectionHeading>VehicleTable / vehicle card</DS.SectionHeading>
      <p className="ds-hint">
        1枚を1台としてグレード・色・参考距離を比較し、カード全体で選択します。
      </p>
      <div className="ds-grid">
        {sampleVehicles.map((vehicle, index) => (
          <DS.RadioCard
            key={vehicle.id}
            variant="vehicle"
            name="catalog-vehicle"
            value={vehicle.id}
            selected={sampleSelection === vehicle.id}
            onSelect={() => setSampleSelection(vehicle.id)}
          >
            <VehicleTable vehicle={vehicle} distanceKm={1.4 + index} />
            <span className="ds-card-dealer">LUMIÈRE 月白</span>
          </DS.RadioCard>
        ))}
      </div>
      <DS.SectionHeading>FilterLayout / StickySummary</DS.SectionHeading>
      <DS.FilterLayout
        filters={
          <div className="ds-stack">
            <DS.Select label="グレード">
              <option>すべて</option>
            </DS.Select>
            <DS.Select label="エリア">
              <option>東京都内すべて</option>
            </DS.Select>
          </div>
        }
        results={
          <DS.StickySummary>選択中：月澄・夜凪ブラック</DS.StickySummary>
        }
      />
      <DS.DescriptionList
        items={[
          { label: "住所", value: "ひかり市 月白町（架空）" },
          { label: "定休日", value: "火曜日" },
          { label: "営業時間", value: "10:00–18:00" },
        ]}
      />
      <DS.SectionHeading>Notice / EmptyState / Loading</DS.SectionHeading>
      <DS.Notice action={<DS.TextButton>再試行</DS.TextButton>}>
        オフラインデータで表示中
      </DS.Notice>
      <DS.Notice variant="error">販売店情報を取得できませんでした。</DS.Notice>
      <DS.EmptyState title="該当する販売店が見つかりませんでした。">
        検索条件を変更してください。
      </DS.EmptyState>
      <DS.Spinner />
      <DS.Skeleton />
      <DS.SectionHeading>Stepper</DS.SectionHeading>
      {[1, 2, 3, 4, 5].map((step) => (
        <DS.Stepper key={step} step={step} />
      ))}
      <DS.SectionHeading>DateTimeField</DS.SectionHeading>
      <DS.DateTimeField
        id="catalog-date"
        label="第1希望日時"
        value={date}
        onChange={setDate}
      />
      <DS.DateTimeField
        id="catalog-date-disabled"
        label="無効"
        value=""
        onChange={() => {}}
        disabled
      />
      <DS.DateTimeField
        id="catalog-date-error"
        label="エラー"
        value=""
        onChange={() => {}}
        error="異なる希望日時をご指定ください。"
      />
      <DS.SectionHeading>
        Header / PageLayout / Band / Placeholder
      </DS.SectionHeading>
      <DS.Header />
      <DS.Band>
        <DS.EmptyState title="検索結果エリア" />
      </DS.Band>
      <div className="ds-grid">
        <DS.Placeholder variant="dealer" label="販売店プレースホルダ" />
        <DS.Placeholder variant="model" label="モデルプレースホルダ" />
      </div>
      <DS.SectionHeading>
        AssetImage：通常・未設定・読み込み失敗
      </DS.SectionHeading>
      <div className="ds-grid">
        <DS.AssetImage src={dealerImage} alt="AI生成の架空店舗" />
        <DS.AssetImage
          variant="dealer-card"
          src="/assets/dealer-card-image.jpeg"
          alt="FigmaデザインのAI生成架空店舗"
        />
        <DS.AssetImage
          variant="model"
          src={modelImage("M01")}
          alt="AI生成の架空車両"
        />
        <DS.AssetImage alt="未設定の店舗" />
        <DS.AssetImage
          src="/missing-catalog-image.jpg"
          alt="読み込み失敗の店舗"
        />
        <DS.AssetImage variant="model" alt="未設定のモデル" />
        <DS.AssetImage
          variant="model"
          src="/missing-catalog-model.jpg"
          alt="読み込み失敗のモデル"
        />
      </div>
      <p className="ds-hint">
        PageLayout
        はこのページの最大幅と余白を管理します。フォーカス状態はTabキーで確認できます。静的部品には無効・読み込み状態を設けません。
      </p>
    </div>
  );
}
