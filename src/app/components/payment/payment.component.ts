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
import { MatIcon } from "@angular/material/icon";

interface GroupedProduct {
  name: string;
  count: number;
  price: number;
  totalPrice: number;
}

@Component({
  selector: "app-payment",
  standalone: true,
  imports: [FormsModule, CommonModule, MatIcon],
  templateUrl: "./payment.component.html",
  styleUrl: "./payment.component.css",
})
export class PaymentComponent {
  amountVal: number = 0;
  displayMode: string = "payment";
  products: any = [];
  groupedProducts: any = [];
  refundProducts: any = [];
  refundOrderNumber: number = 0;
  totalCost: number = 0;
  taxAmount: number = 0;
  paid: number = 0;
  currentOrder: order = {};
  totalPaid: number = 0;
  totalPaidTax: number = 0;
  refundTotal: number = 0;
  sessionId: number = 599;
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
    currentOrderService.currentOrder$.subscribe((val) => {
      this.currentOrder = val;
      this.products = val.products;
      this.refundProducts = val.refundedProducts;
      this.refundOrderNumber = val.refundOrderNumber;
      this.totalCost = Number(val.total.toFixed(2));
      this.totalPaid = val.totalPaid;
      this.totalPaidTax = this.totalPaid - this.totalPaid / (1 + val.taxRate);
      this.refundTotal = val.totalRefund;
      this.totalCost = this.totalCost - this.refundTotal;
      this.totalCost = Number(this.totalCost.toFixed(2));
      this.taxAmount = this.totalCost - this.totalCost / (1 + val.taxRate);
      this.taxAmount = Number(this.taxAmount.toFixed(2));
      //this.calculateTotalCost();
      this.groupProducts();
    });
    odooService.sessionId$.subscribe((val) => {
      if (val) this.sessionId = val;
    });
  }

  payExactAmount(): void {
    this.amountVal = 0;
    this.paid = 0;
    this.moneyOptions.forEach((bill) => {
      bill.count = 0;
    });
    while (this.paid < this.totalCost) {
      if (this.totalCost - this.paid >= 100) {
        this.moneyOptions[0].count++;
        this.paid = this.paid + 100;
      } else if (this.totalCost - this.paid >= 50) {
        this.moneyOptions[1].count++;
        this.paid = this.paid + 50;
      } else if (this.totalCost - this.paid >= 20) {
        this.moneyOptions[2].count++;
        this.paid = this.paid + 20;
      } else if (this.totalCost - this.paid >= 10) {
        this.moneyOptions[3].count++;
        this.paid = this.paid + 10;
      } else if (this.totalCost - this.paid >= 5) {
        this.moneyOptions[4].count++;
        this.paid = this.paid + 5;
      } else if (this.totalCost - this.paid >= 2) {
        this.moneyOptions[5].count++;
        this.paid = this.paid + 2;
      } else if (this.totalCost - this.paid >= 1) {
        this.moneyOptions[6].count++;
        this.paid = this.paid + 1;
      } else if (this.totalCost - this.paid >= 0.5) {
        this.moneyOptions[7].count++;
        this.paid = this.paid + 0.5;
      } else if (this.totalCost - this.paid >= 0.25) {
        this.moneyOptions[8].count++;
        this.paid = this.paid + 0.25;
      } else if (this.totalCost - this.paid >= 0.1) {
        this.moneyOptions[9].count++;
        this.paid = this.paid + 0.1;
      } else if (this.totalCost - this.paid >= 0.05) {
        this.moneyOptions[10].count++;
        this.paid = this.paid + 0.05;
      } else {
        this.moneyOptions[11].count++;
        this.paid = this.paid + 0.01;
      }
      this.paid = Number(this.paid.toFixed(2));
    }
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
    this.amountVal = 0;
    money.count++;
    this.calculatePaid();
  }

  setPaid() {
    this.paid = Math.round(this.amountVal * 100) / 100;
  }

  decreaseMoneyCount(money: Money): void {
    this.amountVal = 0;
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
    this.currentOrder.amountPaid = this.paid;
    this.currentOrder.sessionId = this.sessionId;
    this.currentOrder.status = orderStatusEnum.Paid;
    this.currentOrder.total = this.totalCost;
    this.currentOrder.totalPaidTax = this.totalPaidTax;
    this.storeService.submitOrder(this.currentOrder);
    if (this.currentOrder.products && this.currentOrder.products.length > 0) {
      this.odooService.sendNewOrder(this.currentOrder);
    }
    if (this.currentOrder.refundOrderNumber != undefined) {
      this.odooService.sendRefundOrder(this.currentOrder);
    }
    this.currentOrderService.goToDoneStatus();
    this.userService.addOrderToSessionData(this.currentOrder);
    this.userService.addToRegister(this.currentOrder.total as number);
  }
  backToOrder(): void {
    this.currentOrderService.goToOrderStatus();
  }
}
