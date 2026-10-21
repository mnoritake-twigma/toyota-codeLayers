import m01 from "./models/m01.jpg";
import m03 from "./models/m03.jpg";
import m05 from "./models/m05.jpg";
import m06 from "./models/m06.jpg";
import m07 from "./models/m07.jpg";
import m08 from "./models/m08.jpg";
import m09 from "./models/m09.jpg";
import dealer from "./dealers/d01.jpg";
// Review candidates remain unimported; they are listed in README.md and manifest.json.
const models: Record<string, string> = {
  M01: m01,
  M03: m03,
  M05: m05,
  M06: m06,
  M07: m07,
  M08: m08,
  M09: m09,
};
export const modelImage = (modelCode: string) => models[modelCode];
export const dealerImage = dealer;
