import { Component, inject } from "@angular/core";
import { CurrentOrderService } from "../../../../services/current-order.service";
import { product } from "../../../../models/product";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { RefundModalComponent } from "../refund-modal/refund-modal.component";
import { storeService } from "../../../../services/storeService";
import { customerService } from "../../../../services/customerService";
import { ChooseCustomerComponent } from "../choose-customer/choose-customer.component";
import { MatIcon } from "@angular/material/icon";
import { customer } from "../../../../models/customer";
import { ChooseCouponComponent } from "../choose-coupon/choose-coupon.component";
import { coupon } from "../../../../models/coupon";
import { couponTypeEnum } from "../../../../models/couponTypeEnum";
import { hhItem } from "../../../../models/hhItem";
import { categoryEnum } from "../../../../models/categoryEnum";
import { orderStatusEnum } from "../../../../models/orderStatusEnum";
import { order } from "../../../../models/order";
import { OdooService } from "../../../../services/odoo.service";
import { couponDetail } from "../../../../models/couponDetail";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
  selector: "app-current-order",
  standalone: true,
  imports: [FormsModule, CommonModule, MatIcon, MatProgressSpinnerModule],
  templateUrl: "./current-order.component.html",
  styleUrl: "./current-order.component.css",
  providers: [{ provide: MatDialogRef, useValue: {} }],
})
export class CurrentOrderComponent {
  private dialog = inject(MatDialog);
  currentOrderProducts: Array<product> = [];
  productGroupsWithCouponGroups: Array<any> = [];
  bxgoProducts: Array<product> = [];
  currentOrder: order = {};
  currentOrderCouponsApplied: Array<coupon> = [];
  currentOrderGrouped: Array<{ product: product; count: number }> = [];
  selectedCustomer: customer = {};
  selectedCoupon: coupon = {};
  totalPrice: number = 0;
  refundTotal: number = 0;
  totalCouponDiscount: number = 0;
  totalPriceAfterDiscounts: number = 0;
  taxRate: number = 0;
  totalTaxAmount: number = 0;
  orderTotal: number = 0;
  customerLoading: boolean = true;
  pastOrdersLoading: boolean = true;
  orderStatus: orderStatusEnum = orderStatusEnum.Ordering;
  constructor(
    private currentOrderService: CurrentOrderService,
    private storeService: storeService,
    private customerService: customerService,
    private odooService: OdooService,
  ) {
    odooService.pastOrders$.subscribe((val) => {
      if (val && val.length > 0) {
        this.pastOrdersLoading = false;
      }
    });
    currentOrderService.productsForCurrentOrder$.subscribe((val) => {
      this.totalPrice = 0;
      this.totalCouponDiscount = 0;
      this.currentOrderProducts = val;
      this.determineCurrentOrderGrouped();
      // ("CURRENT ORDER CONTAINS: ");
      // (this.currentOrder);
      //I need some logic here to calculate what coupons are doing to the final price
      this.calculateFinalPrice();
    });
    currentOrderService.bxgoProducts$.subscribe((val) => {
      this.bxgoProducts = val;
    });
    customerService.selectedCustomer$.subscribe((val) => {
      this.selectedCustomer = val;
    });
    storeService.taxRateForStore$.subscribe((val) => {
      this.taxRate = val;
    });
    currentOrderService.orderStatus$.subscribe((val) => {
      this.orderStatus = val;
    });
    currentOrderService.currentOrder$.subscribe((val) => {
      this.currentOrder = val;
      if (val.coupon && val.coupon[0]) {
        this.selectedCoupon = val.coupon[0];
      }
      this.totalPrice = 0;
      this.totalCouponDiscount = 0;
      this.determineCurrentOrderGrouped();
      this.calculateFinalPrice();
    });
    odooService.odooCustomerList$.subscribe((val) => {
      if (val && val.length > 0) {
        this.customerLoading = false;
        val.forEach((customer) => {
          customer.category_id = customer.category_id;
          customer.name = customer.complete_name;
          customer.address = customer.contact_address;
        });
      }
      this.customerService.setCustomers(val);
    });
  }

  calculateFinalPrice() {
    this.refundTotal = 0;
    //STEP 1: Easy part, add up the cost of each product on the order
    if (this.currentOrderProducts.length > 0) {
      this.currentOrderProducts.forEach((product) => {
        this.totalPrice = this.totalPrice + (product.price as number);
      });
    }
    //STEP 2: scan the selected coupon (if any)
    if (this.selectedCoupon && this.selectedCoupon.couponDetail) {
      switch (this.selectedCoupon.couponType) {
        case couponTypeEnum.amountOffOrder:
          //this.totalPrice=this.totalPrice-(this.selectedCoupon.couponDetail.setPrice as number);
          this.totalCouponDiscount = this.selectedCoupon.couponDetail
            .setPrice as number;
          break;
        case couponTypeEnum.discountOnEntireOrder:
          //LOGIC HERE

          var mult = this.selectedCoupon.couponDetail.discount as number;
          mult = (100 - mult) / 100;
          if (mult != 0) {
            this.totalCouponDiscount =
              this.totalCouponDiscount + this.totalPrice * mult;
          } else {
            this.totalCouponDiscount = this.totalPrice;
          }

          break;
        case couponTypeEnum.discountOnProductCategory:
          this.currentOrderProducts.sort(function (a, b) {
            var aprice = a.price as number;
            var bprice = b.price as number;
            var aprice2 = aprice.toString();
            var bprice2 = bprice.toString();
            return parseFloat(aprice2) - parseFloat(bprice2);
          });
          var onlyOnce: boolean = false;
          if (
            this.selectedCoupon.couponDetail &&
            this.selectedCoupon.couponDetail.singleItem
          ) {
            //locate a singular item that fits the description of the coupon, and subtract it's price from the total(discount or setprice accordingly)
            onlyOnce = true;
          }
          //locate each item that fits the description of the coupon and subtract each from the total
          if (
            this.currentOrderProducts.length > 0 &&
            this.selectedCoupon.couponType
          ) {
            var type = this.selectedCoupon.couponDetail.categories;
            var noMore: boolean = false;
            this.currentOrderProducts.forEach((product) => {
              product.category?.forEach((cat) => {
                if (type && type.includes(cat)) {
                  //this product is a match
                  if (!noMore) {
                    if (
                      this.selectedCoupon &&
                      this.selectedCoupon.couponDetail &&
                      this.selectedCoupon.couponDetail.type == "discount" &&
                      product.price
                    ) {
                      var mult = this.selectedCoupon.couponDetail
                        .discount as number;
                      mult = mult / 100;
                      if (mult != 1) {
                        this.totalCouponDiscount =
                          this.totalCouponDiscount + product.price * mult;
                      } else {
                        this.totalCouponDiscount =
                          this.totalCouponDiscount + product.price;
                      }
                    } else {
                      var val = this.selectedCoupon.couponDetail
                        ?.setPrice as number;
                      var price = product.price as number;
                      var discount = price - val;
                      if (discount < 0) discount = 0;
                      this.totalCouponDiscount =
                        this.totalCouponDiscount + discount;
                    }
                    if (onlyOnce) noMore = true;
                  }
                }
              });
            });
          }

          break;
        case couponTypeEnum.discountOnSpecificItem:
          //step 1: sort products so cheapest is at the top, ensuring discount applies to cheapest product
          this.currentOrderProducts.sort(function (a, b) {
            var aprice = a.price as number;
            var bprice = b.price as number;
            var aprice2 = aprice.toString();
            var bprice2 = bprice.toString();
            return parseFloat(aprice2) - parseFloat(bprice2);
          });
          //logic here... scan through each product in the detail of the coupon.
          //see if any of the id's there match what is on the order, add the necessary details
          var onlyOnce: boolean = false;
          if (
            this.selectedCoupon.couponDetail &&
            this.selectedCoupon.couponDetail.singleItem
          ) {
            //locate a singular item that fits the description of the coupon, and subtract it's price from the total(discount or setprice accordingly)
            onlyOnce = true;
          }
          if (
            this.selectedCoupon &&
            this.selectedCoupon.couponDetail &&
            this.selectedCoupon.couponDetail.product
          ) {
            var noMore: boolean = false;
            this.selectedCoupon.couponDetail.product.forEach(
              (couponProduct) => {
                this.currentOrderProducts.forEach((product) => {
                  if (product.id == couponProduct.id) {
                    if (!noMore) {
                      if (
                        this.selectedCoupon &&
                        this.selectedCoupon.couponDetail &&
                        this.selectedCoupon.couponDetail.type == "discount" &&
                        product.price
                      ) {
                        var mult = this.selectedCoupon.couponDetail
                          .discount as number;
                        mult = mult / 100;
                        if (mult != 1) {
                          this.totalCouponDiscount =
                            this.totalCouponDiscount + product.price * mult;
                        } else {
                          this.totalCouponDiscount =
                            this.totalCouponDiscount + product.price;
                        }
                      } else {
                        var price = product.price as number;
                        var saved: number = 0;
                        var val = this.selectedCoupon.couponDetail
                          ?.setPrice as number;
                        saved = price - val;
                        if (saved < 0) saved = 0;
                        this.totalCouponDiscount =
                          this.totalCouponDiscount + saved;
                      }
                      if (onlyOnce) noMore = true;
                    }
                  }
                });
              },
            );
          }

          break;
        case couponTypeEnum.singleUsePerCustomer:
          if (
            this.selectedCoupon.couponDetail.activationCode == "FREEBIE" &&
            this.selectedCoupon.couponDetail.categories != undefined &&
            this.selectedCoupon.couponDetail.categories.includes(
              categoryEnum.PreRoll,
            )
          ) {
            //Freebie is being used!
            if (this.currentOrderProducts.length > 0) {
              this.currentOrderProducts.sort(function (a, b) {
                var aprice = a.price as number;
                var bprice = b.price as number;
                var aprice2 = aprice.toString();
                var bprice2 = bprice.toString();
                return parseFloat(aprice2) - parseFloat(bprice2);
              });
              var discountApplied: boolean = false;
              this.currentOrderProducts.forEach((product) => {
                if (product.name?.includes("Pre-Roll") && !discountApplied) {
                  discountApplied = true;
                  var price = product.price as number;
                  this.totalCouponDiscount = this.totalCouponDiscount + price;
                  //product.price = 0;
                }
              });
            }
          }
      }
    }
    //STEP 3: Scan for refund products and add it to total
    if (
      this.currentOrder &&
      this.currentOrder.refundedProducts &&
      this.currentOrder.refundedProducts.length > 0
    ) {
      this.currentOrder.refundedProducts.forEach((product) => {
        if (product && product.price)
          this.refundTotal = this.refundTotal + product.price;
      });
    }
    this.refundTotal = this.refundTotal + this.refundTotal * this.taxRate;
    this.totalPriceAfterDiscounts =
      this.totalPrice - this.totalCouponDiscount < 0
        ? 0
        : this.totalPrice - this.totalCouponDiscount;
    this.totalTaxAmount = this.totalPriceAfterDiscounts * this.taxRate;
    //this.orderTotal = this.totalPriceAfterDiscounts + this.totalTaxAmount - this.refundTotal;
    this.orderTotal = this.totalPriceAfterDiscounts + this.totalTaxAmount;
    this.orderTotal = Number(this.orderTotal.toFixed(2));
  }

  determineCurrentOrderGrouped() {
    //TODO: Modify this code so that coupon discounted products are shown as a single product in a group with it's individual name.
    //TODO: That way, an order has X orderlines, each one with the proper price for each item.
    //TODO: An extra orderline item called "coupon" (a new product with price 0) is likewise added (modifications to odoo service would be needed.)
    var currentProduct = "";
    var currentProductCountArray: Array<{ product: product; count: number }> =
      [];
    var couponModifiedCostProductCountArray: Array<{
      product: product;
      count: number;
    }> = [];
    var count = 0;
    var finalProduct: product = {};
    if (this.currentOrderProducts && this.currentOrderProducts.length > 0) {
      this.currentOrderProducts.forEach((product) => {
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
      this.currentOrderGrouped = currentProductCountArray;
      this.createProductGroupWithCouponInfo();
    }
  }

  /**
   * Function that either modifies
   * currentOrderGroup's price values or modifies particular sets to have "odooOrderListPrice" value at
   * the coupon price.
   *
   */
  createProductGroupWithCouponInfo() {
    //step 1-A: check for product category discount coupon
    this.productGroupsWithCouponGroups = structuredClone(
      this.currentOrderGrouped,
    );
    var additionalGroups: Array<any> = [];
    console.log(this.currentOrder.coupon);
    if (
      this.currentOrder &&
      this.currentOrder.coupon &&
      this.currentOrder.coupon[0] &&
      this.currentOrder.coupon[0].couponType ==
        couponTypeEnum.discountOnProductCategory
    ) {
      var onlyOnce = false;
      //step 1-B: Check if coupon is for a single product or for all products on order
      var couponDetail = this.currentOrder.coupon[0]
        .couponDetail as couponDetail;
      if (couponDetail.singleItem) {
        console.log("Only a single product will be changed");
        //single use, so add tag into productGroup.product
        this.productGroupsWithCouponGroups.forEach((productGroup) => {
          if (productGroup.product.category) {
            productGroup.product.category.forEach((category) => {
              if (
                couponDetail.categories &&
                couponDetail.categories.includes(category) &&
                !onlyOnce
              ) {
                onlyOnce = true;
                console.log(
                  "Product to be changed: " + productGroup.product.name,
                );
                //Step 1-C: Now check the coupon discount/setprice value
                //now check to see if it's a discount or set price
                // and modify productGroup.product.odooOrderListPrice;
                if (couponDetail.type == "discount" && couponDetail.discount) {
                  console.log("GIVE A " + couponDetail.discount + "% discount");
                  console.log("to the product: " + productGroup.product.name);
                  console.log("because it has the category: " + category);
                  var mult = (100 - couponDetail.discount) / 100;
                  // productGroup.product.odooOrderListPrice =
                  //   (productGroup.product.price as number) * mult;

                  productGroup.product.priceAfterCoupon =
                    (productGroup.product.price as number) * mult;
                  //productGroup.count--;
                  productGroup.product.deductCountForCouponEntry = true;
                } else {
                  console.log("SET PRICE TO: " + couponDetail.setPrice);
                  console.log("to the product: " + productGroup.product.name);
                  console.log("because it has the category: " + category);
                  // productGroup.product.odooOrderListPrice =
                  //   couponDetail.setPrice as number;

                  productGroup.product.priceAfterCoupon =
                    couponDetail.setPrice as number;

                  productGroup.product.deductCountForCouponEntry = true;
                  //productGroup.count--;
                }
              }
            });
          }
        });
      } else {
        console.log("All items that match coupon parameters will be changed");
        //all cases, so modify the productGroup.product.price value
        this.productGroupsWithCouponGroups.forEach((productGroup) => {
          if (productGroup.product.category) {
            productGroup.product.category.forEach((category) => {
              if (
                couponDetail.categories &&
                couponDetail.categories.includes(category)
              ) {
                //now check to see if it's a discount or set price
                // and modify productGroup.product.odooOrderListPrice;
                if (couponDetail.type == "discount" && couponDetail.discount) {
                  console.log("GIVE A " + couponDetail.discount + "% discount");
                  console.log("to the product: " + productGroup.product.name);
                  console.log("because it has the category: " + category);
                  var mult = (100 - couponDetail.discount) / 100;
                  productGroup.product.price =
                    (productGroup.product.price as number) * mult;
                } else {
                  console.log("SET PRICE TO: " + couponDetail.setPrice);
                  console.log("to the product: " + productGroup.product.name);
                  console.log("because it has the category: " + category);
                  productGroup.product.price = couponDetail.setPrice as number;
                }
              }
            });
          }
        });
      }
    }
    //step 2: check for specific product discount coupon
    if (
      this.currentOrder &&
      this.currentOrder.coupon &&
      this.currentOrder.coupon[0] &&
      this.currentOrder.coupon[0].couponType ==
        couponTypeEnum.discountOnSpecificItem &&
      this.currentOrder.coupon[0].couponDetail &&
      this.currentOrder.coupon[0].couponDetail.product
    ) {
      var onlyOnce = false;
      var couponDetail = this.currentOrder.coupon[0]
        .couponDetail as couponDetail;
      if (couponDetail.singleItem) {
        console.log("Only a single product will be changed");
        this.productGroupsWithCouponGroups.forEach((productGroup) => {
          if (couponDetail.product) {
            couponDetail.product.forEach((hhItem) => {
              if (productGroup.product.id == hhItem.id && !onlyOnce) {
                onlyOnce = true;
                console.log(
                  "Product to be changed: " + productGroup.product.name,
                );
                if (couponDetail.type == "discount" && couponDetail.discount) {
                  console.log("GIVE A " + couponDetail.discount + "% discount");
                  console.log("to the product: " + productGroup.product.name);
                  console.log(
                    "because it was found to be inside the product list of the coupon",
                  );
                  var mult = (100 - couponDetail.discount) / 100;
                  // productGroup.product.odooOrderListPrice =
                  //   (productGroup.product.price as number) * mult;

                  productGroup.product.priceAfterCoupon =
                    (productGroup.product.price as number) * mult;
                  productGroup.product.deductCountForCouponEntry = true;
                } else {
                  console.log("SET PRICE TO: " + couponDetail.setPrice);
                  console.log("to the product: " + productGroup.product.name);
                  console.log(
                    "because it was found to be inside the product list of the coupon",
                  );
                  productGroup.product.priceAfterCoupon =
                    couponDetail.setPrice as number;
                  productGroup.product.deductCountForCouponEntry = true;
                }
              }
            });
          }
        });
      } else {
        console.log(
          "all products that fit into coupon product list will be changed",
        );

        this.productGroupsWithCouponGroups.forEach((productGroup) => {
          if (couponDetail.product) {
            couponDetail.product.forEach((hhItem) => {
              if (productGroup.product.id == hhItem.id) {
                if (couponDetail.type == "discount" && couponDetail.discount) {
                  console.log("GIVE A " + couponDetail.discount + "% discount");
                  console.log("to the product: " + productGroup.product.name);
                  console.log(
                    "because it was found to be inside the product list of the coupon",
                  );
                  var mult = (100 - couponDetail.discount) / 100;
                  productGroup.product.price =
                    (productGroup.product.price as number) * mult;
                } else {
                  console.log("SET PRICE TO: " + couponDetail.setPrice);
                  console.log("to the product: " + productGroup.product.name);
                  console.log(
                    "because it was found to be inside the product list of the coupon",
                  );
                  productGroup.product.price = couponDetail.setPrice as number;
                }
              }
            });
          }
        });
      }
    }
    console.log("Final result:");
    console.log(this.productGroupsWithCouponGroups);
  }

  removeItemFromOrder(event) {
    // (event);
    this.currentOrderService.removeItemFromOrder(event.product, event.count);
  }

  increaseItemCount(event) {
    if (event.stock > 0) this.currentOrderService.addItemToOrder(event);
  }

  decreaseItemCount(event) {
    //check if count is at 1, if so, call removeItemFromOrder, otherwise I'll need to create a custom function here
    this.currentOrderService.decreaseItemCount(event);
  }

  removeCoupon() {
    this.currentOrderService.selectCoupon({});
  }

  openRefundModal() {
    //this should open a modal with a list of all orders. Allows user to click on an order from this list, will display details of the order.
    //User can then select individual items within the order to refund. Pressing "refund" button will then return user to this component,
    //with "negative items" in the order
    this.dialog.open(RefundModalComponent, { data: "NO DATA PRESENT" });
  }

  openChooseCustomerModal() {
    //this.customerService.getCustomers();
    this.dialog.open(ChooseCustomerComponent, { data: "NONE" });
  }

  clearSelectedCustomer() {
    this.customerService.setCurrentCustomer({});
  }

  openChooseCoupon() {
    //this.storeService.getCoupons();
    this.dialog.open(ChooseCouponComponent, { data: "NONE" });
    //this will open a modal that contains a list of each coupon available at the store.
  }

  goToPayment() {
    this.currentOrder.products = this.productGroupsWithCouponGroups;
    this.currentOrder.bxgoProducts = this.bxgoProducts;
    this.currentOrder.customer = this.selectedCustomer;
    this.currentOrder.taxRate = this.taxRate;
    this.currentOrder.total = this.orderTotal;
    this.currentOrder.totalCouponDiscount = this.totalCouponDiscount;
    this.currentOrder.totalRefund = this.refundTotal;
    this.currentOrderService.goToPaymentStatus();
  }
}
