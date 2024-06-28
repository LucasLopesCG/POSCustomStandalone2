import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ChooseCustomerComponent } from "../choose-customer/choose-customer.component";
import { MatIcon } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { coupon } from "../../../../models/coupon";
import { CurrentOrderService } from "../../../../services/current-order.service";
import { storeService } from "../../../../services/storeService";
import { product } from "../../../../models/product";
import { couponTypeEnum } from "../../../../models/couponTypeEnum";
import { categoryEnum } from "../../../../models/categoryEnum";
import { customerService } from "../../../../services/customerService";

@Component({
  selector: "app-choose-coupon",
  standalone: true,
  imports: [FormsModule, CommonModule, MatIcon],
  templateUrl: "./choose-coupon.component.html",
  styleUrl: "./choose-coupon.component.css",
})
export class ChooseCouponComponent {
  selectedCustomer:any={};
  availableCoupons: Array<coupon> = [];
  HHDiscountFlag: boolean = false;
  selectedCoupon: coupon = {};
  productsOnOrder: Array<product> = [];
  constructor(
    public dialogRef: MatDialogRef<ChooseCustomerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private currentOrderService: CurrentOrderService,
    private storeService: storeService,
    private customerService: customerService,
  ) {
    customerService.selectedCustomer$.subscribe((val) => {
      this.selectedCustomer = val;
    });
    storeService.discountsForCurrentStore$.subscribe((val) => {
      this.availableCoupons = val.coupon;
    });
    currentOrderService.currentOrder$.subscribe((val) => {
      if (val.coupon && val.coupon[0]) {
        this.selectedCoupon = val.coupon[0];
      }
    });
    currentOrderService.productsForCurrentOrder$.subscribe((val) => {
      this.productsOnOrder = val;
      var flag: boolean = false;
      if (this.productsOnOrder.length > 0) {
        this.productsOnOrder.forEach((product) => {
          if (product.happyHourDiscount) {
            flag = true;
          }
        });
        this.HHDiscountFlag = flag;
        if (this.HHDiscountFlag) {
          this.currentOrderService.selectCoupon({});
        }
      }
    });
  }

  selectCoupon(event) {
    //need to send out a command that adds the coupon to the order
    this.currentOrderService.selectCoupon(event);
    this.close();
  }

  selectFreebie() {
    var freebie: coupon = {
      couponType: couponTypeEnum.singleUsePerCustomer,
      couponDetail: {
        description: "FREEBIE",
        activationCode: "FREEBIE",
        categories: [categoryEnum.PreRoll],
        singleItem: true,
        type: "priceSet",
        setPrice: 0,
        discount: 50,
      },
    };

    //set currentOrderService coupon to be "freebie"
    this.currentOrderService.selectCoupon(freebie);
    this.close();
  }

  close() {
    this.dialogRef.close();
  }
}
