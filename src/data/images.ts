// 同梱のAI生成画像。接続先や試乗車登録に依存しない、デモ用の表示データです。
export const modelImages: Record<string, string> = Object.fromEntries(
  Array.from({ length: 10 }, (_, i) => {
    const code = `M${String(i + 1).padStart(2, "0")}`;
    return [code, `/images/models/${code.toLowerCase()}.jpg`];
  }),
);
export const dealerImages = [
  "/images/dealers/d01.jpg",
  "/images/dealers/d02.jpg",
  "/images/dealers/d03.jpg",
];
// 店舗コードから安定した割り当て。検索や並び替えで画像が変わらないようにします。
export function dealerImage(code: string): string {
  const hash = [...code].reduce((value, char) => value + char.charCodeAt(0), 0);
  return dealerImages[hash % dealerImages.length];
}
