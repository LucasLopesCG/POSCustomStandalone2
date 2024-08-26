import { coupon } from "./coupon";
import { customer } from "./customer";
import { orderStatusEnum } from "./orderStatusEnum";
import { payment } from "./payment";
import { product } from "./product";

export class order {
  products?: Array<{ product: product; count: number; note?: string }>;
  bxgoProducts?: Array<product>;
  comboProducts?: Array<product>;
  refundedProducts?: Array<product>;
  refundOrderNumber?: number;
  totalRefund?: number = 0;
  totalPaid?: number = 0;
  totalPaidTax?: number = 0;
  taxRate?: number;
  paymentDetails?: Array<payment> = [];
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
  guruBucksUsed?: number;
}
