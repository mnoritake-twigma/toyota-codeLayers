import {
  forwardRef,
  useId,
  useState,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from "react";
type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "style" | "color"
> & {
  variant?: "primary" | "secondary";
  loading?: boolean;
  size?: "md" | "lg";
};
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      className = "",
      ...props
    },
    ref,
  ) {
    return (
      <button
        {...props}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={`ds-button ds-button--${variant} ds-button--${size} ${className}`}
      >
        {loading && <Spinner />}
        {children}
      </button>
    );
  },
);
export const TextButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, "variant" | "loading" | "size"> & {
    variant?: "arrow-right" | "chevron-left";
  }
>(function TextButton(
  { variant = "arrow-right", children, className = "", ...props },
  ref,
) {
  return (
    <button {...props} ref={ref} className={`ds-text-button ${className}`}>
      {variant === "chevron-left" && <span aria-hidden="true">› </span>}
      {children}
      {variant === "arrow-right" && <span aria-hidden="true"> →</span>}
    </button>
  );
});
export const Spinner = forwardRef<HTMLSpanElement>(
  function Spinner(_props, ref) {
    return (
      <span
        ref={ref}
        className="ds-spinner"
        role="status"
        aria-label="読み込み中"
      />
    );
  },
);
export const Tag = forwardRef<
  HTMLSpanElement,
  {
    variant?: "bright" | "weak" | "dark";
    size?: "sm" | "lg";
    children: ReactNode;
  }
>(function Tag({ variant = "dark", size = "sm", children }, ref) {
  return (
    <span ref={ref} className={`ds-tag ds-tag--${variant} ds-tag--${size}`}>
      {children}
    </span>
  );
});
type Field = { label: string; hint?: string; error?: string };
function FieldLabel({
  label,
  required,
  id,
}: {
  label: string;
  required?: boolean;
  id: string;
}) {
  return (
    <label htmlFor={id} className="ds-field-label">
      {required && <Tag>必須</Tag>}
      {label}
    </label>
  );
}
function Help({
  id,
  hint,
  error,
}: {
  id: string;
  hint?: string;
  error?: string;
}) {
  return (
    <>
      {hint && (
        <small id={`${id}-hint`} className="ds-hint">
          {hint}
        </small>
      )}
      {error && (
        <small id={`${id}-error`} role="alert" className="ds-error">
          {error}
        </small>
      )}
    </>
  );
}
const described = (
  id: string,
  hint?: string,
  error?: string,
  external?: string,
) =>
  [hint && `${id}-hint`, error && `${id}-error`, external]
    .filter(Boolean)
    .join(" ") || undefined;
export const TextField = forwardRef<
  HTMLInputElement,
  Field &
    Omit<InputHTMLAttributes<HTMLInputElement>, "style" | "color" | "size">
>(function TextField(
  { label, hint, error, id: given, required, ...props },
  ref,
) {
  const uid = useId();
  const id = given || uid;
  return (
    <div className="ds-field">
      <FieldLabel {...{ label, required, id }} />
      <input
        {...props}
        id={id}
        required={required}
        ref={ref}
        aria-invalid={!!error || props["aria-invalid"]}
        aria-describedby={described(id, hint, error, props["aria-describedby"])}
        className="ds-input"
      />
      <Help {...{ id, hint, error }} />
    </div>
  );
});
export const Select = forwardRef<
  HTMLSelectElement,
  Field &
    Omit<SelectHTMLAttributes<HTMLSelectElement>, "style" | "color" | "size">
>(function Select(
  { label, hint, error, id: given, required, children, ...props },
  ref,
) {
  const uid = useId();
  const id = given || uid;
  const [localValue, setLocalValue] = useState(props.defaultValue ?? "");
  return (
    <div className="ds-field">
      <FieldLabel {...{ label, required, id }} />
      <div className="ds-select-wrap">
        <select
          {...props}
          onChange={(e) => {
            setLocalValue(e.target.value);
            props.onChange?.(e);
          }}
          id={id}
          required={required}
          ref={ref}
          aria-invalid={!!error || props["aria-invalid"]}
          aria-describedby={described(
            id,
            hint,
            error,
            props["aria-describedby"],
          )}
          className={`ds-input ${(props.value ?? localValue) === "" ? "ds-placeholder" : ""}`}
        >
          {children}
        </select>
        <span aria-hidden="true">▼</span>
      </div>
      <Help {...{ id, hint, error }} />
    </div>
  );
});
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  Field & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "style" | "color">
>(function Textarea(
  { label, hint, error, id: given, required, ...props },
  ref,
) {
  const uid = useId();
  const id = given || uid;
  return (
    <div className="ds-field">
      <FieldLabel {...{ label, required, id }} />
      <textarea
        {...props}
        id={id}
        required={required}
        ref={ref}
        aria-invalid={!!error || props["aria-invalid"]}
        aria-describedby={described(id, hint, error, props["aria-describedby"])}
        className="ds-textarea"
      />
      <Help {...{ id, hint, error }} />
    </div>
  );
});
export const Tabs = forwardRef<
  HTMLDivElement,
  {
    label: string;
    items: { value: string; label: string; disabled?: boolean }[];
    value: string;
    onChange: (v: string) => void;
    panelId?: string;
  }
>(function Tabs({ label, items, value, onChange, panelId }, ref) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div className="ds-tabs" role="tablist" aria-label={label} ref={ref}>
      {items.map((item, i) => (
        <button
          key={item.value}
          ref={(el) => {
            buttons.current[i] = el;
          }}
          type="button"
          id={`tab-${item.value}`}
          role="tab"
          disabled={item.disabled}
          aria-selected={value === item.value}
          aria-controls={panelId}
          tabIndex={value === item.value ? 0 : -1}
          onClick={() => onChange(item.value)}
          onKeyDown={(e) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key))
              return;
            e.preventDefault();
            const enabled = items
              .map((x, index) => (!x.disabled ? index : -1))
              .filter((x) => x >= 0);
            const pos = enabled.indexOf(i);
            const target =
              e.key === "Home"
                ? enabled[0]
                : e.key === "End"
                  ? enabled.at(-1)!
                  : enabled[
                      (pos +
                        (e.key === "ArrowRight" ? 1 : -1) +
                        enabled.length) %
                        enabled.length
                    ];
            onChange(items[target].value);
            buttons.current[target]?.focus();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
});
export const RadioCard = forwardRef<
  HTMLInputElement,
  {
    name: string;
    value: string;
    selected: boolean;
    disabled?: boolean;
    onSelect: () => void;
    children: ReactNode;
  }
>(function RadioCard({ children, selected, onSelect, ...props }, ref) {
  return (
    <label className={`ds-radio-card ${selected ? "ds-selected" : ""}`}>
      <input
        {...props}
        ref={ref}
        type="radio"
        checked={selected}
        onChange={onSelect}
      />
      <span>{children}</span>
    </label>
  );
});
export const DateTimeField = forwardRef<
  HTMLInputElement,
  {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    required?: boolean;
    disabled?: boolean;
    error?: string;
  }
>(function DateTimeField(
  { id, label, value, onChange, required = true, disabled, error },
  ref,
) {
  const [date = "", time = ""] = value.split("T");
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return (
    <fieldset className="ds-date-field">
      <legend>{label}</legend>
      <div className="ds-grid">
        <TextField
          ref={ref}
          id={id}
          label="日付"
          type="date"
          required={required}
          disabled={disabled}
          min={today}
          aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
          aria-invalid={!!error}
          value={date}
          onInput={(e) => onChange(`${e.currentTarget.value}T${time}`)}
          onChange={(e) => onChange(`${e.target.value}T${time}`)}
        />
        <Select
          label="時間帯"
          required={required}
          disabled={disabled}
          aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
          aria-invalid={!!error}
          value={time}
          onChange={(e) => onChange(`${date}T${e.target.value}`)}
        >
          <option value="">お選びください</option>
          {Array.from(
            { length: 17 },
            (_, i) =>
              `${String(10 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`,
          ).map((t) => (
            <option key={t}>{t}</option>
          ))}
        </Select>
      </div>
      <Help
        id={id}
        hint="日本時間でのご希望をお伺いします。日時は確定ではございません。"
        error={error}
      />
    </fieldset>
  );
});
