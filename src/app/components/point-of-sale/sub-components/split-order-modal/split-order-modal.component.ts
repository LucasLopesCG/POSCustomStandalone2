import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { DragDropModule } from "@angular/cdk/drag-drop";
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { CurrentOrderService } from "../../../../services/current-order.service";
import { storeService } from "../../../../services/storeService";
import { OdooService } from "../../../../services/odoo.service";
import { CurrentOrderComponent } from "../current-order/current-order.component";

@Component({
  selector: "app-split-order-modal",
  standalone: true,
  imports: [FormsModule, CommonModule, MatIcon, CdkDrag, DragDropModule],
  templateUrl: "./split-order-modal.component.html",
  styleUrl: "./split-order-modal.component.css",
})
export class SplitOrderModalComponent {
  currentOrder: any = {};
  originalOrderProducts: Array<any> = [];
  newOrderProducts: Array<any> = [];
  newOrderNickname = "";
  constructor(
    public dialogRef: MatDialogRef<SplitOrderModalComponent>,
    private currentOrderService: CurrentOrderService,
    private storeService: storeService,
    private odooService: OdooService,
    private currentOrderComponent: CurrentOrderComponent,
  ) {
    currentOrderService.currentOrder$.subscribe((val) => {
      this.originalOrderProducts = [];
      this.currentOrder = val;
      this.currentOrder.products.forEach((productGroup) => {
        var count: number = 0;
        while (count < productGroup.count) {
          count++;
          this.originalOrderProducts.push(productGroup.product);
        }
      });
      console.log(this.originalOrderProducts);
    });
  }
  close() {
    //Need to send out a command here that stores how many $1 discounts were applied.
    //These translate as adding coupons to the order?
    this.dialogRef.close();
  }

  splitAndMakeOrders() {
    var newOrder = structuredClone(this.currentOrder);
    this.newOrderProducts.sort(this.dynamicSort("name"));
    if (this.newOrderProducts && this.newOrderProducts.length > 0) {
      var newProducts: Array<any> = [];
      var productGroup = this.newOrderProducts[0];
      var count = 0;
      this.newOrderProducts.forEach((product) => {
        if (product.name == productGroup.name) {
          count++;
        } else {
          newProducts.push({ product: productGroup, count: count });
          count = 1;
          productGroup = product;
        }
      });
      newProducts.push({ product: productGroup, count: count });
      newOrder.products = newProducts;
      this.storeService.addIncompleteOrder({
        order: structuredClone(newOrder),
        nickName: structuredClone(this.newOrderNickname),
      });
      this.odooService.createDraftOrder(newOrder);
      //create logic here that adds products that are in this order back to the stock quantities.
      newOrder.products.forEach((productGroup) => {
        var count: number = 0;
        while (count < productGroup.count) {
          count++;
          this.currentOrderComponent.decreaseItemCount(productGroup.product);
        }
      });
    }
    var newOriginalOrderProducts: Array<any> = [];
    if (this.originalOrderProducts && this.originalOrderProducts.length > 0) {
      var productGroup = this.originalOrderProducts[0];
      var count = 0;
      this.originalOrderProducts.forEach((product) => {
        if (product.name == productGroup.name) {
          count++;
        } else {
          newOriginalOrderProducts.push({
            product: productGroup,
            count: count,
          });
          count = 1;
          productGroup = product;
        }
      });
      newOriginalOrderProducts.push({ product: productGroup, count: count });
      this.currentOrder.products = newOriginalOrderProducts;
      this.currentOrderService.setProductsForOrder(this.originalOrderProducts);
      this.originalOrderProducts.forEach((productGroup) => {
        var count: number = 0;
        while (count < productGroup.count) {
          count++;
          this.currentOrderComponent.increaseItemCount(productGroup.product);
        }
      });
      this.currentOrderService.setCurrentOrder(this.currentOrder);
    }
    this.close();
  }

  dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a, b) {
      /* next line works with strings and numbers,
       * and you may want to customize it to your needs
       */
      var result =
        a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
      return result * sortOrder;
    };
  }

  todo = ["Get to work", "Pick up groceries", "Go home", "Fall asleep"];

  done = ["Get up", "Brush teeth", "Take a shower", "Check e-mail", "Walk dog"];

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
}
