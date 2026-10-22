import { forwardRef } from "react";
import { AssetImage } from "./AssetImage";
import { DescriptionList } from "./Layout";

export interface DealerInfoCardProps {
  name: string;
  address: string;
  businessHours: string;
  closedDays: string;
  imageSrc?: string;
}

/** 店舗の紹介用。車両情報や申し込み対象の選択状態を持たない。 */
export const DealerInfoCard = forwardRef<HTMLElement, DealerInfoCardProps>(
  function DealerInfoCard(
    { name, address, businessHours, closedDays, imageSrc },
    ref,
  ) {
    return (
      <article ref={ref} className="ds-dealer-info-card" aria-label={name}>
        <AssetImage
          variant="dealer-cover"
          src={imageSrc}
          alt={`${name}：AI生成の架空店舗イメージ`}
        />
        <div className="ds-dealer-info-content">
          <h3 className="ds-dealer-info-title">{name}</h3>
          <DescriptionList
            items={[
              { label: "住所", value: address },
              { label: "営業時間", value: businessHours },
              { label: "定休日", value: closedDays },
            ]}
          />
        </div>
      </article>
    );
  },
);
