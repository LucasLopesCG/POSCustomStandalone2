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
import { userService } from "../../../../services/userService";
import { ProductListComponent } from "../product-list/product-list.component";

@Component({
  selector: "app-resume-order-modal",
  standalone: true,
  imports: [FormsModule, CommonModule, MatIcon],
  templateUrl: "./resume-order-modal.component.html",
  styleUrl: "./resume-order-modal.component.css",
})
export class ResumeOrderModalComponent {
  incompleteOrders: Array<any> = [];
  incompleteOrdersOdoo: Array<any> = [];
  selectedOrder: any = {};
  TESTONLY: any = {};
  sessionId: number = 0;
  user: any = {};
  constructor(
    public dialogRef: MatDialogRef<ResumeOrderModalComponent>,
    private odooService: OdooService,
    private customerService: customerService,
    private storeService: storeService,
    private currentOrderService: CurrentOrderService,
    private userService: userService,
    public productList: ProductListComponent,
  ) {
    storeService.incompleteOrders$.subscribe((val) => {
      this.incompleteOrders = val;
    });
    odooService.sessionId$.subscribe((val) => {
      if (val && val > 0) this.sessionId = val;
      this.odooService.getDraftOrdersBySessionId(val.toString());
    });
    odooService.draftOrders$.subscribe((val) => {
      if (val && val.length > 0) {
        this.incompleteOrdersOdoo = val;
        this.incompleteOrdersOdoo = this.convertOdooOrderFormat();
        this.incompleteOrdersOdoo = this.removeOutOfStockOrders();
      }
      //console.log(this.incompleteOrdersOdoo);
    });
    currentOrderService.currentOrder$.subscribe((val) => {
      this.TESTONLY = val;
      console.log(this.productList.filteredProducts);
    });
    userService.dataUser$.subscribe((val) => {
      this.user = val;
    });
  }

  removeOutOfStockOrders() {
    var output: any = [];
    //step 1: grab each order:
    this.incompleteOrdersOdoo.forEach((order) => {
      //step 2: for each order, check to see if each product in it has stock
      var valid: boolean = true;
      var productsToLoop: Array<any> = [];
      order.products.forEach((productGroup) => {
        var id = productGroup.product.product_id[0];
        this.productList.filteredProducts.forEach((variantGroup) => {
          variantGroup.forEach((product) => {
            if (product.id == id) {
              if ((product.stock as number) >= productGroup.count) {
                console.log(
                  "There is enough stock for the product: " + product.name,
                );
                productsToLoop.push({
                  product: product,
                  count: productGroup.count,
                });
              } else {
                console.log(
                  "There is not enough stock for this order: " + product.name,
                );
                valid = false;
              }
            }
          });
        });
      });
      //check to see if order has enought stock to be valid, add it to output if so;
      if (valid) {
        console.log("order is valid, adding to output");
        console.log(order);
        output.push({ order: order, productsToLoop: productsToLoop });
      }
    });
    return output;
  }

  convertOdooOrderFormat() {
    var output: any = [];
    this.incompleteOrdersOdoo.forEach((incompleteOrder) => {
      var newResumeOrder: any = {
        products: [],
        bxgoProducts: [],
        comboProducts: [],
        coupon: [],
        orderNumber: 0,
        receiptNumber: "None",
        cashier: this.user.name,
        total: 0,
        customer: {},
        status: "Ordering",
        date: new Date(),
      };

      //Step 1: Create products array by going through lines and creating product groups.

      if (incompleteOrder && incompleteOrder.lines.length > 0) {
        var newProducts: Array<any> = [];
        var productGroup = incompleteOrder.lines[0];
        var count = 0;
        incompleteOrder.lines.forEach((product) => {
          if (product.name == productGroup.name) {
            count++;
          } else {
            productGroup.name = productGroup.product_id[1];
            newProducts.push({ product: productGroup, count: count });
            count = 1;
            productGroup = product;
          }
        });
        productGroup.name = productGroup.product_id[1];
        newProducts.push({ product: productGroup, count: count });
        newResumeOrder.products = newProducts;
      }
      newResumeOrder.id = incompleteOrder.id;
      output.push(newResumeOrder);
    });
    return output;
  }

  selectOrder(num) {
    this.selectedOrder = this.incompleteOrdersOdoo[num];
    console.log(this.selectedOrder);
  }

  deleteDraft(incompleteOrder) {
    this.odooService.deleteDraftOrder(incompleteOrder.order.id);
    this.odooService.getDraftOrdersBySessionId(this.sessionId.toString());
  }

  resumeSelectedOrder() {
    var clone = structuredClone(this.selectedOrder);
    //update the necessary things in order to make the order continue.
    //update customer
    //update coupons
    //update selected order
    //remove the incomplete order from the list
    this.currentOrderService.setCurrentOrder(clone.order);
    if (clone.order.customer && clone.order.customer.name) {
      this.customerService.setCurrentCustomer(clone.order.customer);
    }
    if (clone.order.products && clone.order.products.length > 0) {
      var productArray: Array<any> = [];
      clone.order.products.forEach((productGroup) => {
        var maxCount = productGroup.count;
        var count: number = 0;
        while (count < maxCount) {
          productArray.push(productGroup.product);
          count++;
        }
      });
      //this.currentOrderService.resumeOrder(productArray);
    }
    clone.productsToLoop.forEach((productGroup) => {
      var count: number = 0;
      while (count < productGroup.count) {
        count++;
        this.productList.addProductToOrder(productGroup.product);
      }
    });
    this.storeService.resumeIncompleteOrder(clone);
    this.odooService.deleteDraftOrder(clone.order.id);
    this.close();
  }
  close() {
    //Need to send out a command here that stores how many $1 discounts were applied.
    //These translate as adding coupons to the order?
    this.dialogRef.close();
  }
}
