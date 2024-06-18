import { coupon } from "./coupon";
import { customer } from "./customer";
import { orderStatusEnum } from "./orderStatusEnum";
import { product } from "./product";

export class order {
  products?: Array<{ product: product; count: number }>;
  bxgoProducts?: Array<product>;
  comboProducts?: Array<product>;
  refundedProducts?: Array<product>;
  refundOrderNumber?: number;
  taxRate?: number;
  coupon?: Array<coupon>;
  orderNumber?: number;
  receiptNumber?: string;
  cashier?: string;
  total?: number;
  customer?: customer;
  status?: orderStatusEnum;
  date?: Date;
}
