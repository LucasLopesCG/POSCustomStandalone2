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
  totalRefund?: number = 0;
  taxRate?: number;
  coupon?: Array<coupon>;
  orderNumber?: number;
  orderId?: number;
  receiptNumber?: string;
  cashier?: string;
  total?: number;
  amountPaid?: number;
  customer?: customer;
  status?: orderStatusEnum;
  date?: Date;
  totalCouponDiscount?: number;
  refunded_order_ids?: Array<number>;
  sessionId?: number;
}
