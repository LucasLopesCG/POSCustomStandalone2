import { hhDetail } from "./hhDetail";
import { hhTypeEnum } from "./hhTypeEnum";

export class happyHour {
  id?: number;
  description?: string;
  hhStart?: Date;
  hhEnd?: Date;
  hhType?: hhTypeEnum;
  hhDetail?: hhDetail;
}
