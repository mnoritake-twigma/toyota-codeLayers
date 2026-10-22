import m02 from "./models/m02.jpg";
import m04 from "./models/m04.jpg";
import m10 from "./models/m10.jpg";
import d02 from "./dealers/d02.jpg";
import d03 from "./dealers/d03.jpg";
import m01 from "./models/m01.jpg";
import m03 from "./models/m03.jpg";
import m05 from "./models/m05.jpg";
import m06 from "./models/m06.jpg";
import m07 from "./models/m07.jpg";
import m08 from "./models/m08.jpg";
import m09 from "./models/m09.jpg";
import dealer from "./dealers/d01.jpg";
const models: Record<string, string> = {
  M01: m01,
  M02: m02,
  M04: m04,
  M10: m10,
  M03: m03,
  M05: m05,
  M06: m06,
  M07: m07,
  M08: m08,
  M09: m09,
};
export const modelImage = (modelCode: string) => models[modelCode];
export const dealerImage = dealer;

export const dealerImageFor = (code: string) => {
  const hash = Array.from(code).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return [dealer, d02, d03][hash % 3];
};

const figmaDealerImages = [
  "5eb9a.png",
  "12361.png",
  "942aa.png",
  "6f780.png",
  "d8dd0.png",
  "71c2f.png",
  "48309.png",
  "2d238.png",
  "c27fa.png",
  "c6f1b.png",
  "2b4e0.png",
  "b7f02.png",
  "f55fe.png",
  "fb88e.png",
  "1a448.png",
  "4ce8d.png",
  "b99d6.png",
  "63c66.png",
  "11e75.png",
  "70d08.png",
  "adb8a.png",
  "d9543.png",
  "7185c.png",
  "23300.png",
  "87281.png",
  "094c6.png",
  "d8eec.png",
  "01b99.png",
];

const auraVehicleOrder = [
  "V-13-006-M01-1",
  "V-13-007-M01-1",
  "V-13-008-M01-1",
  "V-13-009-M01-1",
  "V-13-010-M01-1",
  "V-13-011-M01-1",
  "V-13-011-M01-2",
  "V-13-012-M01-1",
  "V-13-013-M01-1",
  "V-13-014-M01-1",
  "V-13-015-M01-1",
  "V-13-016-M01-1",
  "V-13-017-M01-1",
  "V-13-018-M01-1",
  "V-13-019-M01-1",
  "V-13-020-M01-1",
  "V-13-021-M01-1",
  "V-13-021-M01-2",
  "V-13-022-M01-1",
  "V-13-023-M01-1",
  "V-13-024-M01-1",
  "V-13-025-M01-1",
  "V-13-026-M01-1",
  "V-13-027-M01-1",
  "V-13-028-M01-1",
  "V-13-029-M01-1",
  "V-13-030-M01-1",
  "V-13-031-M01-1",
];

const figmaDealerImageByVehicle = new Map(
  auraVehicleOrder.map((vehicleId, index) => [
    vehicleId,
    `/assets/dealers/${figmaDealerImages[index]}`,
  ]),
);

export const dealerVehicleImage = (vehicleId: string) => {
  const exact = figmaDealerImageByVehicle.get(vehicleId);
  if (exact) return exact;
  const hash = Array.from(vehicleId).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  );
  return `/assets/dealers/${figmaDealerImages[hash % figmaDealerImages.length]}`;
};
