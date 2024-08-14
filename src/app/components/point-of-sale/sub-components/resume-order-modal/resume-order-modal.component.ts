import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { CurrentOrderService } from "../../../../services/current-order.service";
import { OdooService } from "../../../../services/odoo.service";
import { storeService } from "../../../../services/storeService";
import { customerService } from "../../../../services/customerService";
import { order } from "../../../../models/order";

@Component({
  selector: "app-resume-order-modal",
  standalone: true,
  imports: [FormsModule, CommonModule, MatIcon],
  templateUrl: "./resume-order-modal.component.html",
  styleUrl: "./resume-order-modal.component.css",
})
export class ResumeOrderModalComponent {
  incompleteOrders: Array<any> = [];
  selectedOrder: order = {};
  constructor(
    public dialogRef: MatDialogRef<ResumeOrderModalComponent>,
    private odooService: OdooService,
    private customerService: customerService,
    private storeService: storeService,
    private currentOrderService: CurrentOrderService,
  ) {
    storeService.incompleteOrders$.subscribe((val) => {
      this.incompleteOrders = val;
    });
  }

  selectOrder(num) {
    this.selectedOrder = this.incompleteOrders[num].order;
  }

  resumeSelectedOrder() {
    var clone = structuredClone(this.selectedOrder);
    //update the necessary things in order to make the order continue.
    //update customer
    //update coupons
    //update selected order
    //remove the incomplete order from the list
    this.currentOrderService.setCurrentOrder(clone);
    if (clone.customer && clone.customer.name) {
      this.customerService.setCurrentCustomer(clone.customer);
    }
    if (clone.products && clone.products.length > 0) {
      var productArray: Array<any> = [];
      clone.products.forEach((productGroup) => {
        var maxCount = productGroup.count;
        var count: number = 0;
        while (count < maxCount) {
          productArray.push(productGroup.product);
          count++;
        }
      });
      this.currentOrderService.resumeOrder(productArray);
    }
    this.storeService.resumeIncompleteOrder(clone);
    this.close();
  }
  close() {
    //Need to send out a command here that stores how many $1 discounts were applied.
    //These translate as adding coupons to the order?
    this.dialogRef.close();
  }
}
