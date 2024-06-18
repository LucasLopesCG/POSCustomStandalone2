import { hhBXGO } from "./hhBXGO";
import { hhCategory } from "./hhCategory";
import { hhCombo } from "./hhCombo";
import { hhItem } from "./hhItem";

export class hhDetail {
  happyHourItemList?: Array<hhItem>;
  happyHourCategoryList?: Array<hhCategory>;
  happyHourDiscountAll?: number;
  happyHourBXGO?: hhBXGO;
  happyHourCombo?: Array<hhCombo>;
  //HappyHourBXGOList?:Array<hhBXGO>;
  //happyHourComboList?:Array<hhCombo>;
}
