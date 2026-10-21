import { forwardRef, useId, type ReactNode, type HTMLAttributes } from "react";
import { Tag } from "./Controls";
export const SectionHeading = forwardRef<
  HTMLHeadingElement,
  { children: ReactNode; required?: boolean }
>(function SectionHeading({ children, required }, ref) {
  return (
    <h2 ref={ref} className="ds-section-heading">
      {required && <Tag>必須</Tag>}
      {children}
    </h2>
  );
});
export const Accordion = forwardRef<
  HTMLDetailsElement,
  {
    title: ReactNode;
    summary?: ReactNode;
    children: ReactNode;
    defaultOpen?: boolean;
  }
>(function Accordion({ title, summary, children, defaultOpen }, ref) {
  const id = useId();
  return (
    <details ref={ref} className="ds-accordion" open={defaultOpen}>
      <summary aria-controls={id}>
        <span className="ds-accordion-title">{title}</span>
        {summary}
        <span className="ds-toggle" aria-hidden="true" />
      </summary>
      <div id={id}>{children}</div>
    </details>
  );
});
export const DataTable = forwardRef<
  HTMLTableElement,
  {
    caption: string;
    columns: string[];
    rows: { key: string; cells: ReactNode[] }[];
  }
>(function DataTable({ caption, columns, rows }, ref) {
  return (
    <div className="ds-table-scroll">
      <table ref={ref} className="ds-table">
        <caption className="ds-sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th scope="col" key={c}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              {row.cells.map((c, i) => (
                <td key={i}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
export const DescriptionList = forwardRef<
  HTMLDListElement,
  {
    items: { label: string; value: ReactNode }[];
  }
>(function DescriptionList({ items }, ref) {
  return (
    <dl ref={ref} className="ds-description">
      {items.map(({ label, value }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
});
export const Notice = forwardRef<
  HTMLDivElement,
  {
    variant?: "info" | "error";
    children: ReactNode;
    action?: ReactNode;
  }
>(function Notice({ variant = "info", children, action }, ref) {
  return (
    <div
      ref={ref}
      className={`ds-notice ds-notice--${variant}`}
      role={variant === "error" ? "alert" : "status"}
    >
      {children}
      {action}
    </div>
  );
});
const labels = ["モデル選択", "販売店選択", "情報の入力", "内容の確認", "完了"];
export const Stepper = forwardRef<HTMLElement, { step: number }>(
  function Stepper({ step }, ref) {
    return (
      <nav ref={ref} aria-label={`進行状況 ${step}/5`} className="ds-stepper">
        <ol>
          {labels.map((label, i) => (
            <li key={label} aria-current={step === i + 1 ? "step" : undefined}>
              <span
                className={`ds-step-circle ${step >= i + 1 ? "ds-step-reached" : ""}`}
                aria-hidden="true"
              >
                {step > i + 1 ? "✓" : i + 1}
              </span>
              <span>{label}</span>
              <span className="ds-sr-only">
                {step > i + 1 ? "完了" : step === i + 1 ? "現在" : "未到達"}
              </span>
            </li>
          ))}
        </ol>
      </nav>
    );
  },
);
export const Band = forwardRef<HTMLDivElement, { children: ReactNode }>(
  function Band({ children }, ref) {
    return (
      <div ref={ref} className="ds-band">
        <div className="ds-container">{children}</div>
      </div>
    );
  },
);
export const Skeleton = forwardRef<HTMLDivElement>(
  function Skeleton(_props, ref) {
    return (
      <div
        ref={ref}
        className="ds-skeleton"
        role="status"
        aria-label="読み込み中"
      />
    );
  },
);
export const EmptyState = forwardRef<
  HTMLDivElement,
  {
    title: string;
    children?: ReactNode;
  }
>(function EmptyState({ title, children }, ref) {
  return (
    <div ref={ref} className="ds-empty">
      <p>{title}</p>
      {children && <p className="ds-hint">{children}</p>}
    </div>
  );
});
export const Header = forwardRef<HTMLElement, { onHome?: () => void }>(
  function Header({ onHome }, ref) {
    return (
      <header ref={ref} className="ds-header">
        <div className="ds-container ds-row">
          <a
            href="/"
            onClick={(e) => {
              if (onHome) {
                e.preventDefault();
                onHome();
              }
            }}
            aria-label="LUMIÈRE モデル選択へ"
            className="ds-logo"
          >
            LUMIÈRE
          </a>
          <span className="ds-hint">TEST DRIVE APPLICATION</span>
        </div>
      </header>
    );
  },
);
export const PageLayout = forwardRef<
  HTMLElement,
  Omit<HTMLAttributes<HTMLElement>, "style" | "color">
>(function PageLayout({ children, ...props }, ref) {
  return (
    <main {...props} ref={ref} className="ds-container ds-page">
      {children}
    </main>
  );
});
export const Placeholder = forwardRef<
  HTMLDivElement,
  {
    variant?: "dealer" | "model";
    label: string;
  }
>(function Placeholder({ variant = "dealer", label }, ref) {
  return (
    <div
      ref={ref}
      className={`ds-placeholder-image ds-placeholder-image--${variant}`}
      role="img"
      aria-label={label}
    >
      <span aria-hidden="true">LUMIÈRE</span>
    </div>
  );
});
