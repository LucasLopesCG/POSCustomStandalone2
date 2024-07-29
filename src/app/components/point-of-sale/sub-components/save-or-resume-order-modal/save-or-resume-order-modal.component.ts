import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { OdooService } from "../../../../services/odoo.service";
import { storeService } from "../../../../services/storeService";
import { CurrentOrderService } from "../../../../services/current-order.service";
import { order } from "../../../../models/order";
import { customerService } from "../../../../services/customerService";

@Component({
  selector: "app-save-or-resume-order-modal",
  standalone: true,
  imports: [FormsModule, CommonModule, MatIcon],
  templateUrl: "./save-or-resume-order-modal.component.html",
  styleUrl: "./save-or-resume-order-modal.component.css",
})
export class SaveOrResumeOrderModalComponent {
  currentOrder: order = {};
  orderNickname: string = "";
  constructor(
    public dialogRef: MatDialogRef<SaveOrResumeOrderModalComponent>,
    private odooService: OdooService,
    private customerService: customerService,
    private storeService: storeService,
    private currentOrderService: CurrentOrderService,
  ) {
    currentOrderService.currentOrder$.subscribe((val) => {
      this.currentOrder = val;
    });
  }

  saveCurrentOrder() {
    //add current order to store service's back up of orders.
    //reset selected coupon and other pointers.
    //create a blank order.
    this.storeService.addIncompleteOrder({
      order: structuredClone(this.currentOrder),
      nickName: structuredClone(this.orderNickname),
    });
    this.currentOrderService.selectCoupon({});
    this.currentOrderService.newOrder();
    //this.currentOrderService.
    this.customerService.setCurrentCustomer({});
    this.close();
  }

  close() {
    //Need to send out a command here that stores how many $1 discounts were applied.
    //These translate as adding coupons to the order?
    this.dialogRef.close();
  }
}
