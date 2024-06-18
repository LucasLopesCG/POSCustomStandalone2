import { couponDetail } from "./couponDetail";
import { couponTypeEnum } from "./couponTypeEnum";

export class coupon{
    couponType?:couponTypeEnum;
    couponDetail?:couponDetail; //changes depending on what coupon type enum value is
}