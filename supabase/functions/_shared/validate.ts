export function validateRequest(
  value: unknown,
  now = Date.now(),
): string | null {
  if (!value || typeof value !== "object") return "入力内容をご確認ください。";
  const v = value as Record<string, unknown>;
  for (const key of [
    "modelCode",
    "dealerId",
    "name",
    "kana",
    "email",
    "phone",
    "preferred1",
    "preferred2",
    "notes",
  ])
    if (typeof v[key] !== "string") return "入力内容をご確認ください。";
  const s = v as Record<string, string>;
  if (!/^M(0[1-9]|10)$/.test(s.modelCode) || !/^\d{2}-\d{3}$/.test(s.dealerId))
    return "モデルと販売店をご確認ください。";
  if (
    !s.name.trim() ||
    s.name.length > 100 ||
    !s.kana.trim() ||
    s.kana.length > 100 ||
    !/^[ァ-ヶー　 ]+$/.test(s.kana)
  )
    return "氏名・フリガナをご確認ください。";
  if (s.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email))
    return "メールアドレスをご確認ください。";
  if (
    !/^[0-9 -]{10,20}$/.test(s.phone) ||
    s.phone.replace(/[^0-9]/g, "").length < 10
  )
    return "電話番号をご確認ください。";
  if (s.notes.length > 2000) return "備考は2000文字以内でご入力ください。";
  for (const key of ["preferred1", "preferred2"])
    if (
      !/(Z|[+-]\d{2}:\d{2})$/.test(s[key]) ||
      !Number.isFinite(Date.parse(s[key])) ||
      Date.parse(s[key]) <= now
    )
      return "希望日時は未来の日時をご指定ください。";
  if (Date.parse(s.preferred1) === Date.parse(s.preferred2))
    return "第1希望と第2希望は異なる日時をご指定ください。";
  return null;
}
