import { categoryEnum } from "./categoryEnum";
import { hhItem } from "./hhItem";

export class couponDetail {
  categories?: Array<categoryEnum>;
  product?: Array<hhItem>;
  singleItem?: boolean;
  type?: string;

  discount?: number;
  setPrice?: number;
  
  activationCode?: string;
  description?: string;
  singleUsePerCustomer?: boolean;
  limitedOverallUse?: boolean;
  totalAllowedUse?: number;
}
