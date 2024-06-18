import { Component, OnInit } from "@angular/core";
import { storeService } from "../../services/storeService";
import { CurrentOrderService } from "../../services/current-order.service";
import { product } from "../../models/product";
import { Money } from "../../models/Money";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { order } from "../../models/order";
import { orderStatusEnum } from "../../models/orderStatusEnum";
import { userService } from "../../services/userService";
import { OdooService } from "../../services/odoo.service";

interface GroupedProduct {
  name: string;
  count: number;
  price: number;
  totalPrice: number;
}

@Component({
  selector: "app-payment",
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: "./payment.component.html",
  styleUrl: "./payment.component.css",
})
export class PaymentComponent {
  displayMode: string = "payment";
  products: any = [];
  groupedProducts: any = [];
  totalCost: number = 0;
  paid: number = 0;
  currentOrder: order = {};
  moneyOptions: Money[] = [
    { name: "$100", count: 0, value: 100 },
    { name: "$50", count: 0, value: 50 },
    { name: "$20", count: 0, value: 20 },
    { name: "$10", count: 0, value: 10 },
    { name: "$5", count: 0, value: 5 },
    { name: "$2", count: 0, value: 2 },
    { name: "$1", count: 0, value: 1 },
    { name: "50c", count: 0, value: 0.5 },
    { name: "25c", count: 0, value: 0.25 },
    { name: "10c", count: 0, value: 0.1 },
    { name: "5c", count: 0, value: 0.05 },
    { name: "1c", count: 0, value: 0.01 },
  ];

  constructor(
    private storeService: storeService,
    private currentOrderService: CurrentOrderService,
    private userService: userService,
    private odooService: OdooService,
  ) {
    // currentOrderService.productsForCurrentOrder$.subscribe((products) => {
    //   this.products = products;
    //   console.log(this.products);
    //   this.calculateTotalCost();
    //   this.groupProducts();
    // });
    currentOrderService.currentOrder$.subscribe((val) => {
      this.currentOrder = val;
      this.products = val.products;
      this.totalCost = val.total;
      //this.calculateTotalCost();
      this.groupProducts();
      //console.log(this.currentOrder);
    });
  }

  groupProducts(): void {
    this.groupedProducts = this.products;
  }

  calculateTotalCost() {
    this.totalCost = 0;
    this.products.forEach((product) => {
      if (product && product.product && product.product.price) {
        this.totalCost = this.totalCost + product.product.price * product.count;
      }
    });
    var tax = this.currentOrder.taxRate as number;
    this.totalCost = this.totalCost * tax + this.totalCost;
    Math.round(this.totalCost * 100) / 100;
    this.totalCost = Math.ceil(this.totalCost * 100) / 100;
  }

  increaseMoneyCount(money: Money): void {
    money.count++;
    this.calculatePaid();
  }

  decreaseMoneyCount(money: Money): void {
    if (money.count > 0) {
      money.count--;
      this.calculatePaid();
    }
  }

  calculatePaid(): void {
    this.paid = 0;
    for (let money of this.moneyOptions) {
      this.paid += money.value * money.count;
    }
    this.paid = Math.round(this.paid * 100) / 100;
  }

  get change(): number {
    if (this.paid - this.totalCost < 0) return 0;
    return this.paid - this.totalCost;
  }

  createGrouping(
    products: Array<product>,
  ): Array<{ product: product; count: number }> {
    var output: Array<{ product: product; count: number }> = [];
    var currentProductCountArray: Array<{ product: product; count: number }> =
      [];
    var count = 0;
    var finalProduct: product = {};
    if (products && products.length > 0) {
      products.forEach((product) => {
        var groupFound = false;
        currentProductCountArray.forEach((productGroup) => {
          if (productGroup.product.name == product.name) {
            //Found the product inside the order, increment the value of productGroup
            productGroup.count++;
            groupFound = true;
          }
        });
        if (!groupFound) {
          currentProductCountArray.push({ product: product, count: 1 });
        }
      });
    }

    return currentProductCountArray;
  }

  submitPayment(): void {
    //console.log("Submit payment");
    this.displayMode = "DONE";
    //call service to submit order here
    //This would ideally cause previous orders to refresh with my previously submitted order.
    //For the sake of testing, just pushing the value to previous orders.
    //this.currentOrder.products = this.createGrouping(this.products);
    if (
      this.currentOrder.refundedProducts &&
      this.currentOrder.refundedProducts.length > 0
    ) {
      //TODO: Locate the order thats being refunded via this call and set it to refunded (update it to remove the items that were refunded)
      //refundOrder.status=orderStatusEnum.Refunded
      //refundOrder.products = what it was minus the products inside of refunded products.
    }
    if (!this.currentOrder.bxgoProducts) {
      this.currentOrder.bxgoProducts = [];
    }
    if (!this.currentOrder.refundedProducts) {
      this.currentOrder.refundedProducts = [];
    }
    this.currentOrder.status = orderStatusEnum.Paid;
    this.currentOrder.total = this.totalCost;
    this.storeService.submitOrder(this.currentOrder);
    this.odooService.saveNewOrder(this.currentOrder);
    this.currentOrderService.goToDoneStatus();
    this.userService.addOrderToSessionData(this.currentOrder);
  }
  backToOrder(): void {
    this.currentOrderService.goToOrderStatus();
  }
}
