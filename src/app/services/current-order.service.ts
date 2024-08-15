import { Injectable } from "@angular/core";
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscribable,
  Subscription,
  of,
  scan,
} from "rxjs";
import { product } from "../models/product";
import { coupon } from "../models/coupon";
import { order } from "../models/order";
import { userService } from "./userService";
import { User } from "../models/user";
import { orderStatusEnum } from "../models/orderStatusEnum";
import { storeService } from "./storeService";
import { OdooService } from "./odoo.service";
@Injectable({
  providedIn: "root",
})
export class CurrentOrderService {
  private productsForCurrentOrderArray: Array<product> = [];
  bxgoProductsArray: Array<product> = [];
  user: User = {};
  currentOrderCopy: order = {};
  selectedLocation: any = {};
  availableTaxRates: Array<any> = [];

  private currentOrder = new BehaviorSubject<any>({});
  private productsForCurrentOrder = new BehaviorSubject<any>({});
  private selectedCoupon = new BehaviorSubject<any>({});
  private bxgoProducts = new BehaviorSubject<any>({});
  private orderStatus = new BehaviorSubject<any>({});
  private disableButtons = new BehaviorSubject<boolean>(false);

  productsForCurrentOrder$ = this.productsForCurrentOrder.asObservable();
  selectedCoupon$ = this.selectedCoupon.asObservable();
  currentOrder$ = this.currentOrder.asObservable();
  bxgoProducts$ = this.bxgoProducts.asObservable();
  orderStatus$ = this.orderStatus.asObservable();
  disableButtons$ = this.disableButtons.asObservable();

  constructor(
    private userService: userService,
    private storeService: storeService,
  ) {
    this.productsForCurrentOrder$.subscribe((val) => {
      this.productsForCurrentOrderArray = val;
    });
    this.userService.dataUser$.subscribe((val) => {
      this.user = val;
    });
    this.bxgoProducts$.subscribe((val) => {
      this.bxgoProductsArray = val;
    });
    this.currentOrder$.subscribe((val) => {
      this.currentOrderCopy = val;
    });
  }

  public setDisableButtons(val) {
    this.disableButtons.next(val);
  }

  public addItemToOrder(value) {
    this.disableButtons.next(true);
    // ("Attempting to add To the order");
    // (value);
    var newArray: Array<product> = [];
    if (this.productsForCurrentOrderArray.length > 0) {
      var newArray: Array<product> = this.productsForCurrentOrderArray;
    }
    newArray.push(value);
    this.currentOrderCopy.products = this.groupUpProducts(newArray);
    this.currentOrder.next(this.currentOrderCopy);
    this.productsForCurrentOrder.next(newArray);

    //Include a check here to Add free item if BXGO conditions fulfilled.
    if (value.happyHourDiscount && value.bxgo && value.bxgo > 0) {
      var count: number = 0;
      this.productsForCurrentOrderArray.forEach((product) => {
        if ((product.id = value.id)) {
          count++;
        }
      });
      var howManyBXGO = Math.trunc(count / value.bxgo);
      var extraCount: number = 0;
      if (!this.bxgoProductsArray || !this.bxgoProductsArray.length) {
        this.bxgoProductsArray = [];
        this.setBXGOProductArray(this.bxgoProductsArray);
      }
      this.bxgoProductsArray.forEach((product) => {
        if (product.id == value.id) {
          extraCount++;
        }
      });
      var howManyToAdd = howManyBXGO - extraCount;
      if (howManyToAdd > 0) {
        var count: number = 0;
        while (count < howManyToAdd) {
          count++;
          if (value.stock >= 2) this.addBXGOProductToArray(value);
        }
      }
      //This number tells me how many of the item I should have as BXGO.
    }
    this.removeCouponIfHappyHourProduct();
    //Decrease count of product
    this.storeService.decreaseStockOfProduct(value);
  }

  public decreaseItemCount(value) {
    this.disableButtons.next(true);
    // ("Attempting to decrease the count from 1 item");
    // (value);
    var noneFlag: boolean = false;
    var excludeIndex: number = 0;
    var indexCount: number = 0;
    this.productsForCurrentOrderArray.forEach((val) => {
      if (val.id == value.id) {
        excludeIndex = indexCount;
        noneFlag = true;
      }
      indexCount++;
    });
    var newArray: Array<product> = [];
    var count = 0;
    this.productsForCurrentOrderArray.forEach((product) => {
      if (count != excludeIndex) {
        newArray.push(product);
      }
      count++;
    });

    this.currentOrderCopy.products = this.groupUpProducts(newArray);
    this.currentOrder.next(this.currentOrderCopy);

    //Include a check here to REMOVE free item if BXGO conditions are no longer fulfilled.

    if (value.happyHourDiscount && value.bxgo && value.bxgo > 0) {
      var count: number = 0;
      newArray.forEach((product) => {
        if ((product.id = value.id)) {
          count++;
        }
      });
      var howManyBXGO = Math.trunc(count / value.bxgo);
      var freeCount: number = 0;

      this.bxgoProductsArray.forEach((product) => {
        if (product.id == value.id) {
          freeCount++;
        }
      });
      var howManyToRemove = freeCount - howManyBXGO;
      if (howManyToRemove > 0) {
        var count: number = 0;
        while (count < howManyToRemove) {
          count++;
          this.removeBXGOProductFromArray(value);
        }
      }
      //This number tells me how many of the item I should have as BXGO.
    }

    this.productsForCurrentOrder.next(newArray);
    this.storeService.increaseStockOfProduct(value);
  }

  setProductsForOrder(products) {
    this.productsForCurrentOrder.next(products);
  }

  groupUpProducts(inputArray) {
    var currentProduct = "";
    var currentProductCountArray: Array<{ product: product; count: number }> =
      [];
    var count = 0;
    var finalProduct: product = {};
    if (inputArray && inputArray.length > 0) {
      inputArray.forEach((product) => {
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
      // ("GROUPED PRODUCT ORDER: ");
      // (currentProductCountArray);
      return currentProductCountArray;
    }
    return [];
  }

  public selectCoupon(coupon: coupon) {
    this.currentOrderCopy.coupon = [coupon];
    this.currentOrder.next(this.currentOrderCopy);
    this.selectedCoupon.next(coupon);
    //This needs to trigger a series of recalculations over at order tracking component
  }

  public setOrderGBUsed(val: number) {
    this.currentOrderCopy.guruBucksUsed = val;
    this.currentOrder.next(this.currentOrderCopy);
  }

  removeCouponIfHappyHourProduct() {
    this.productsForCurrentOrder.forEach((product) => {
      if (product.happyHourDiscount) {
        this.selectCoupon({});
      }
    });
  }

  public removeItemFromOrder(value, count) {
    var output: Array<product> = [];
    // ("Attempting to remove from the order");
    // (value);
    this.productsForCurrentOrderArray.forEach((product) => {
      if (product.id == value.id) {
        // ("FOUND AN INSTANCE OF THE PRODUCT TO BE REMOVED!");
      } else {
        output.push(product);
      }
    });
    var bxgoArray: Array<product> = [];
    if (!this.bxgoProductsArray || !this.bxgoProductsArray.length) {
      this.setBXGOProductArray([]);
    }
    this.bxgoProductsArray.forEach((val) => {
      if (val.id == value.id) {
        this.storeService.increaseStockOfProduct(value);
      } else {
        bxgoArray.push(val);
      }
    });
    this.setBXGOProductArray(bxgoArray);
    // ("The products in the order should now be:");
    // (output);
    //this.productsForCurrentOrderArray = output;
    //this.productsForCurrentOrder.next(output);
    var count2: number = 0;
    while (count2 < count) {
      this.decreaseItemCount(value);
      count2++;
    }
  }

  public newOrder() {
    var newOrder: order = {
      products: [],
      bxgoProducts: [],
      comboProducts: [],
      coupon: [],
      orderNumber: 0,
      receiptNumber: "idk?",
      cashier: this.user.name,
      total: 0,
      customer: {},
      status: orderStatusEnum.Ordering,
      //taxRate: this.determineTaxRate(this.selectedLocation),
      date: new Date(),
    };
    this.productsForCurrentOrder.next(newOrder.products);
    this.currentOrder.next(newOrder);
    this.orderStatus.next(orderStatusEnum.Ordering);
  }

  public resumeOrder(products: Array<product>) {
    this.productsForCurrentOrder.next(products);
    this.orderStatus.next(orderStatusEnum.Ordering);
  }

  public setBXGOProductArray(products: Array<product>) {
    this.bxgoProducts.next(products);
  }

  public emptyBXGOProductArray() {
    this.bxgoProducts.next([]);
  }

  public addBXGOProductToArray(product: product) {
    this.bxgoProductsArray.push(product);
    this.bxgoProducts.next(this.bxgoProductsArray);
    this.storeService.decreaseStockOfProduct(product);
  }

  public removeBXGOProductFromArray(product: product) {
    var didOnce: boolean = false;
    var newArray: Array<product> = [];
    this.bxgoProductsArray.forEach((val) => {
      if (val.id == product.id && !didOnce) {
        didOnce = true;
      } else {
        newArray.push(val);
      }
    });
    this.bxgoProducts.next(newArray);
    this.storeService.increaseStockOfProduct(product);
  }

  public refundSelected(val) {
    this.currentOrder.next(val);
  }

  public setCurrentOrder(order) {
    this.currentOrder.next(order);
  }

  public goToPaymentStatus() {
    this.orderStatus.next(orderStatusEnum.Paying);
  }
  public goToOrderStatus() {
    this.orderStatus.next(orderStatusEnum.Ordering);
  }

  public goToDoneStatus() {
    this.orderStatus.next(orderStatusEnum.Paid);
  }

  public addCustomerToOrder(customer) {
    this.currentOrderCopy.customer = customer;
    this.currentOrder.next(this.currentOrderCopy);
  }
}
