import { Injectable, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { order } from "../models/order";
import { offlineModeService } from "./offlineMode.service";
import { storeLocationEnum } from "../models/storeLocation";
import { customer } from "../models/customer";
import { odooInfo } from "../models/odooInfo";
import { storeService } from "./storeService";
import { CurrentOrderService } from "./current-order.service";
import { couponTypeEnum } from "../models/couponTypeEnum";

@Injectable({
  providedIn: "root",
})
export class OdooService implements OnInit {
  odooPastOrderArray: any = [];
  odooPastOrderLineArray: any = [];

  private orderPlaced = new BehaviorSubject<boolean>(false);
  private paymentPlaced = new BehaviorSubject<boolean>(false);
  private pickingsForOrder = new BehaviorSubject<boolean>(false);
  private pickingsLinkedToOrder = new BehaviorSubject<boolean>(false);
  private orderInOdoo = new BehaviorSubject<any>({});
  private odooProducts = new BehaviorSubject<any>({});
  private customers = new BehaviorSubject<any>({});
  private pastOrders = new BehaviorSubject<any>({});
  private pastOrderLines = new BehaviorSubject<any>({});
  private odooStocks = new BehaviorSubject<any>({});
  private odooPriceListValues = new BehaviorSubject<any>({});
  private productLoadComplete = new BehaviorSubject<boolean>(false);
  private stockLoadComplete = new BehaviorSubject<boolean>(false);
  private odooCustomerList = new BehaviorSubject<any>({});
  private combinedProductData = new BehaviorSubject<any>({});
  private testImageSub = new BehaviorSubject<any>({});

  orderPlaced$ = this.orderPlaced.asObservable();
  paymentPlaced$ = this.paymentPlaced.asObservable();
  pickingsForOrder$ = this.pickingsForOrder.asObservable();
  pickingsLinkedToOrder$ = this.pickingsLinkedToOrder.asObservable();
  orderInOdoo$ = this.orderInOdoo.asObservable();
  odooProducts$ = this.odooProducts.asObservable();
  customers$ = this.customers.asObservable();
  pastOrders$ = this.pastOrders.asObservable();
  pastOrderLines$ = this.pastOrderLines.asObservable();
  odooStocks$ = this.odooStocks.asObservable();
  odooPriceListValues$ = this.odooPriceListValues.asObservable();
  productLoadComplete$ = this.productLoadComplete.asObservable();
  stockLoadComplete$ = this.stockLoadComplete.asObservable();
  odooCustomerList$ = this.odooCustomerList.asObservable();
  combinedProductData$ = this.combinedProductData.asObservable();
  testImageSub$ = this.testImageSub.asObservable();

  selectedLocation: any = null;
  session_data: any = null;
  config: odooInfo = { url: "", port: "", username: "", password: "", db: "" };
  host: string | null = "";
  port: string | null = "";
  secure: boolean = false;
  uid: any = 0;
  private middleManUrl = "https://phpstack-1248616-4634628.cloudwaysapps.com";
  headers = new HttpHeaders({
    "Content-Type": "text/xml",
  });

  constructor(
    private http: HttpClient,
    private offlineMode: offlineModeService,
    private storeService: storeService,
    private currentOrderService: CurrentOrderService,
  ) {
    this.pastOrders$.subscribe((val) => {
      //save this value and call the other service to pull lines
      if (val && val.length > 0) {
        this.odooPastOrderArray = val;
        //this.getPastOrderLines();
        this.storeService.setPastOrdersForStore(this.odooPastOrderArray);
      }
    });
    this.pastOrderLines$.subscribe((val) => {
      if (val && val.length > 0) {
        this.odooPastOrderLineArray = val;
        this.combineOdooOrderLines();
      }
    });
    storeService.dataSelectedStoreLocation$.subscribe((val) => {
      this.selectedLocation = val;
      //Run logic here to gather information of the locations the user has access to:
    });
  }
  ngOnInit(): void {}

  createSession(configId, userId, cashStart) {
    const odooUrl = this.middleManUrl + "/api/createPOSSession"; // Replace with your Odoo instance URL
    var odooSession: any = {
      configId: configId,
      userId: userId,
      cashStart: cashStart,
    };
    const body = JSON.stringify(odooSession);
    this.http.put(odooUrl, body).subscribe(
      (response) => {
        //this.pas.next(response);
        console.log(response);
        // update the customer on local side to have this newly created id, saving a get call
      },
      (error) => {
        console.error(error);
      },
    );
  }

  productsLoaded() {
    this.productLoadComplete.next(true);
  }
  stocksLoaded() {
    this.stockLoadComplete.next(true);
  }

  submitNewCustomer(newCustomer: any) {
    const odooUrl = this.middleManUrl + "/api/createcustomer"; // Replace with your Odoo instance URL

    var odooCustomer: any = {
      name: "John Doe Tic Tac Toe",
      email: "john.doe@example.com",
      phone: "123456789",
      mobile: "4448675309",
      street: "123 Main St",
      city: "New York",
      country_id: 1, // Assuming country_id is an integer representing the country in Odoo
    };
    console.log(odooCustomer);
    const body = JSON.stringify(odooCustomer);

    this.http.put(odooUrl, body).subscribe(
      (response) => {
        //this.pas.next(response);
        console.log(response);
        // update the customer on local side to have this newly created id, saving a get call
      },
      (error) => {
        console.error(error);
      },
    );
  }

  wipeProductData() {
    this.combinedProductData.next([]);
  }

  getCombinedProductData(stockFilter: string) {
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");
    headers.append("Origin", "http://localhost:3000");

    this.http
      .get(
        this.middleManUrl +
          `/api/combinedProductData?stockFilter=${stockFilter}`,
      )
      .subscribe(
        (response) => {
          //console.log("Response:", response);
          this.combinedProductData.next(response);
        },
        (error) => {
          //console.log("Error:", error);
        },
      );
  }

  getProducts() {
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");
    headers.append("Origin", "http://localhost:3000");

    this.http.get(this.middleManUrl + "/api/products").subscribe(
      (response) => {
        //console.log("Response:", response);
        this.odooProducts.next(response);
      },
      (error) => {
        //console.log("Error:", error);
      },
    );
  }

  getStocks() {
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");
    headers.append("Origin", "http://localhost:3000");

    this.http.get(this.middleManUrl + "/api/stocks").subscribe(
      (response) => {
        //console.log("Response:", response);
        this.odooStocks.next(response);
      },
      (error) => {
        //console.log("Error:", error);
      },
    );
  }

  getPriceListValues() {
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");
    headers.append("Origin", "http://localhost:3000");

    this.http.get(this.middleManUrl + "/api/priceListRule").subscribe(
      (response) => {
        //console.log("Response:", response);
        this.odooPriceListValues.next(response);
      },
      (error) => {
        //console.log("Error:", error);
      },
    );
  }

  getCustomers() {
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");
    headers.append("Origin", "http://localhost:3000");

    this.http.get(this.middleManUrl + "/api/customers").subscribe(
      (response) => {
        //console.log("Response:", response);
        this.odooCustomerList.next(response);
      },
      (error) => {
        //console.log("Error:", error);
      },
    );
  }

  getCustomersByPhone(phone: number) {}

  getCustomersByName(name: string) {}

  /**
   *
   * @param customer the customer information we will use to filter order results by
   * NEED TO IMPLEMENT
   * Retrieve all orders for the currently selected customer. Used by past orders modal component (by look-up).
   */
  getPastOrdersForCustomers() {
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");
    headers.append("Origin", "http://localhost:3000");

    this.http.get(this.middleManUrl + "/api/pastOrders").subscribe(
      (response) => {
        //console.log("Response:", response);
        this.pastOrders.next(response);
      },
      (error) => {
        //console.log("Error:", error);
      },
    );
  }

  getPastOrderLines() {
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");
    headers.append("Origin", "http://localhost:3000");

    this.http.get(this.middleManUrl + "/api/pastOrderLines").subscribe(
      (response) => {
        //console.log("Response:", response);
        this.pastOrderLines.next(response);
      },
      (error) => {
        //console.log("Error:", error);
      },
    );
  }

  combineOdooOrderLines() {
    var output: any = [];
    this.odooPastOrderArray.forEach((order) => {
      var newOrder: order = { products: [] };
      order.lines.forEach((line) => {
        var filterResult = this.odooPastOrderLineArray.filter((val) => {
          if (val.id == line) {
            return true;
          }

          return false;
        });
        if (filterResult && filterResult[0] && newOrder && newOrder.products) {
          newOrder.products.push({
            product: {
              id: filterResult[0].product_id[0],
              name: filterResult[0].product_id[1],
              price: filterResult[0].price_subtotal_incl,
            },
            count: filterResult[0].qty,
          });
        }
      });
      if (newOrder && newOrder.products && newOrder.products.length > 0) {
        newOrder.orderNumber = order.display_name;
        newOrder.cashier = order.cashier;
        newOrder.date = order.create_date;
        newOrder.total = order.amountPaid;
        output.push(newOrder);
      }
    });
    this.storeService.setPastOrdersForStore(output);
  }

  orderWithinSystem(boolean) {
    this.orderPlaced.next(true);
  }
  paymentWithinSystem(boolean) {
    this.paymentPlaced.next(true);
  }
  pickingsCreated(boolean) {
    this.pickingsForOrder.next(true);
  }
  pickingsLinked(boolean) {
    this.pickingsLinkedToOrder.next(true);
  }
  orderComplete(value) {
    this.orderInOdoo.next(value);
  }

  /**
   *
   * @param order order object containing products,refunds,customer information,cashier information,etc
   * Sends order generated by the system to odoo.
   * includes logic to send all offline orders if it suceeds in contacting odoo. Will likewise add to offline orders if it fails
   */
  sendNewOrder(order: order, offlineOrder: boolean = false) {
    // if (this.session_data == null) {
    //   this.getAuth();
    // }
    const odooUrl = this.middleManUrl + "/api/order-line"; // Replace with your Odoo instance URL

    var lines: Array<any> = [];
    var total = order.total as number;
    var taxRate = order.taxRate as number;
    var amountPaid = order.amountPaid as number;
    var amountTaxed = total - total / (1 + taxRate);
    var config_id: number = 0;
    var fiscal_position_id: number = 0;
    var paymentMethodId: number = 0;
    var sessionId: number = 0;

    if (this.selectedLocation) {
      if (this.selectedLocation.location == storeLocationEnum.Apopka) {
        config_id = 1;
        fiscal_position_id = 2;
        paymentMethodId = 1;
        sessionId = 599;
      }
      if (this.selectedLocation.location == storeLocationEnum.DeLand) {
        config_id = 4;
        fiscal_position_id = 4;
        paymentMethodId = 7;
        sessionId = 622;
      }
      if (this.selectedLocation.location == storeLocationEnum.Orlando) {
        config_id = 3;
        fiscal_position_id = 5;
        paymentMethodId = 8;
        sessionId = 579;
      }
      if (this.selectedLocation.location == storeLocationEnum.Sanford) {
        config_id = 2;
        fiscal_position_id = 1;
        paymentMethodId = 5;
        sessionId = 599;
      }
    }
    if (order && order.products && order.products.length > 0) {
      order.products.forEach((product) => {
        var price = product.product.price as number;
        if (!product.product.deductCountForCouponEntry) {
          var count: number = 0;
          while (count < product.count) {
            var newLine: any = {
              product_id: product.product.id,
              product_name: product.product.name,
              quantity: 1,
              price_unit: price,
              total_price: price * product.count,
            };
            count++;
            lines.push(newLine);
          }
        } else {
          if (product.count - 1 > 0) {
            var count: number = 0;
            while (count < product.count - 1) {
              var newLine: any = {
                product_id: product.product.id,
                product_name: product.product.name,
                quantity: 1,
                price_unit: price,
                total_price: price * product.count,
              };
              count++;
              lines.push(newLine);
            }
          }
          var couponPrice = product.product.priceAfterCoupon as number;
          var couponLine: any = {
            product_id: product.product.id,
            product_name: product.product.name,
            quantity: 1,
            price_unit: couponPrice,
            total_price: couponPrice,
          };
          lines.push(couponLine);
        }
      });
    }
    //CHECK TO SEE IF FREEBIE WAS USED: SEND OUT TAG!
    if (
      order.coupon &&
      order.customer &&
      order.coupon &&
      order.coupon[0] &&
      order.coupon[0].couponType == couponTypeEnum.singleUsePerCustomer
    ) {
      var customerId = { customer_id: order.customer.id, tag_id: 1 };
      const odooTagUrl = this.middleManUrl + "/api/addTagToCustomer";
      const body2 = JSON.stringify(customerId);
      //send out order here to update the customer with the FREEBIE tag.
      this.http.post(odooTagUrl, body2).subscribe(
        (response) => {
          console.log(response);
          console.log("customer should now have FREEBIE tag.");
        },
        (error) => {
          console.error(error);
        },
      );
    }

    //SEND OUT ORDER PROPER
    var odooStyleOrder: any = {
      amount_tax: amountTaxed,
      amount_total: total,
      amount_paid: total,
      amount_return: amountPaid - total,
      session_id: sessionId,
      name: "POS_CUSTOM_ORDER",
      cashier: order.cashier,
      config_id: config_id,
      fiscal_position_id: fiscal_position_id,
      lines: lines,
    };
    console.log(odooStyleOrder);
    const body = JSON.stringify(odooStyleOrder);

    this.http.put(odooUrl, body).subscribe(
      (response) => {
        //this.pas.next(response);
        console.log(response);
        //since it actually went through, tell offline mode to start dumping orders by recursively calling this function.
        //fire off event to let display know order is now in system.
        this.orderWithinSystem(true);
        var responseVal = response as unknown;
        order.orderNumber = responseVal as number;
        this.currentOrderService.setCurrentOrder(order);
        var amount = order.amountPaid as number;
        var total = order.total as number;
        var change = total - amount;
        //this.PayAndDeductProducts(order, offlineOrder, amount);
        this.PayAndDeductProducts(
          order,
          amountPaid,
          lines,
          config_id,
          paymentMethodId,
          true,
        );
        if (change < 0) {
          this.PayAndDeductProducts(
            order,
            change,
            lines,
            config_id,
            paymentMethodId,
            false,
          );
        }
        //this.validateOrder(order);
        this.offlineMode.removeOrderFromList(order);
        if (this.offlineMode.orderListArray.length > 0) {
          this.sendNewOrder(this.offlineMode.orderListArray[0], true);
        }
      },
      (error) => {
        console.error(error);
        //check if server connection is lost, if so, add this order to offlineService(but only if its an order already present in the list )
        if (!offlineOrder) this.offlineMode.addNewOrder(order);
      },
    );
  }

  /**
   * Works similar to sendNewOrder, but will only grab the products within refundedProducts array.
   * Will create an order whose's name is the same as the order that is being refunded (with "REFUND" added to end of it)
   * Will create pickings and payments in the same line as sendNewOrder, but will use the refund values instead.
   * Also adds links to the "refunded_order_ids" field (the value of refundOrderNumber field)
   * Once that is done, i need to grab the order.lines for the refunded order.
   * Then check each one to see if that was an order.line that was refunded. If so, create link to the appropriate line.
   *
   * @param order
   * @param offlineOrder
   */
  sendRefundOrder(order: order, offlineOrder: boolean = false) {
    var odooStyleOrder: any = {};
    odooStyleOrder.id = order.refundOrderNumber;
    odooStyleOrder.cashier = order.cashier;
    odooStyleOrder.refundAmount = order.totalRefund as number;
    odooStyleOrder.refundAmount = odooStyleOrder.refundAmount * -1;
    odooStyleOrder.products = [];
    if (order && order.refundedProducts) {
      order.refundedProducts?.forEach((product) => {
        odooStyleOrder.products.push(product.id);
      });
    }
    const body = JSON.stringify(odooStyleOrder);
    const odooUrl = this.middleManUrl + "/api/createRefundOrder"; // Replace with your Odoo instance URL
    this.http.put(odooUrl, body).subscribe(
      (response) => {
        console.log("Success? This actually should not happen?");
      },
      (error) => {
        console.log("refund order error?");
        console.log("Refund order created... now validate the picking");
        var txt = error.error.text;
        var txt2 = txt.split("}]")[0];
        var eachVar = txt2.split(",");
        var pickingId: number = +eachVar[0].split(":")[1];
        var orderId: number = +eachVar[1].split(":")[1];

        /*

        "[{\"pickingId\":25208,\"orderId\":14922}]
        */

        var linkingBody = {
          pickingId: pickingId,
          orderId: orderId,
          orderNumber: orderId,
        };
        const linkBodyJSON = JSON.stringify(linkingBody);

        const odooPickingValidateLinkUrl =
          this.middleManUrl + "/api/validatePicking";
        this.http.post(odooPickingValidateLinkUrl, linkBodyJSON).subscribe(
          (val) => {
            console.log("picking for refund validated?");
            this.validateOrder(linkingBody);
          },
          (error) => {
            console.log("picking validated via error?");
            this.validateOrder(linkingBody);
          },
        );
      },
    );
  }

  PayAndDeductProducts(
    order,
    amount,
    lines,
    config_id,
    paymentMethodId,
    createPickings: boolean = false,
  ) {
    var pickingLineIds: Array<number> = [];
    const odooUrl = this.middleManUrl + "/api/order-pay"; // Replace with your Odoo instance URL

    var odooStyleOrder: any = {
      config_id: config_id,
      paymentMethodId: paymentMethodId,
      amount: amount,
      orderId: order.orderNumber,
    };
    console.log(odooStyleOrder);
    const body = JSON.stringify(odooStyleOrder);

    this.http.put(odooUrl, body).subscribe(
      (response) => {
        //this.pas.next(response);
        console.log(response);
        // a payment line was created. Now go through each product in the list and create the pickings for each:
        if (createPickings) {
          console.log(
            "Actual payment processed, now create pickings for order",
          );
          this.paymentWithinSystem(true);
          var locationId: number = 0;
          var pickingTypeId: number = 0;
          if (this.selectedLocation) {
            if (this.selectedLocation.location == storeLocationEnum.Apopka) {
              locationId = 69;
              pickingTypeId = 71;
            }
            if (this.selectedLocation.location == storeLocationEnum.DeLand) {
              locationId = 30;
              pickingTypeId = 24;
            }
            if (this.selectedLocation.location == storeLocationEnum.Orlando) {
              locationId = 44;
              pickingTypeId = 36;
            }
            if (this.selectedLocation.location == storeLocationEnum.Sanford) {
              locationId = 18;
              pickingTypeId = 12;
            }
          }
          var responseCount = lines.length;
          var requestCount: number = 0;
          var lineProductIds: Array<number> = [];
          var lineQuantities: Array<number> = [];
          var products: Array<any> = [];
          lines.forEach((lineData) => {
            var count: number = 0;
            while (count < lineData.quantity) {
              products.push({
                product_id: lineData.product_id,
                product_uom_qty: 1,
                product_name: lineData.product_name,
              });
              count++;
            }
          });
          var pickingData = {
            location_dest_id: 5, //physical location-user
            location_id: locationId, //44 ORL/Stock, 30 DL/STOCK,69 APS/STOCK, 18 SANFO/STOCK
            picking_type_id: pickingTypeId,
            origin: order.orderNumber,
            products: products,
          };
          const pickingBody = JSON.stringify(pickingData);
          //now call the service to create the picking and then link it to the order!
          const odooPickingUrl = this.middleManUrl + "/api/makeOrderPickings"; // Replace with your Odoo instance URL
          this.http.put(odooPickingUrl, pickingBody).subscribe(
            (response) => {
              console.log("Created a picking: ");
              console.log(response);
              pickingLineIds.push(response as number);
              console.log("Remember the id of this!");
            },
            (error) => {
              var txt = error.error.text;
              txt = txt.split(": ")[1];
              txt = txt.replace(/\D/g, "");
              var pickingLineId: number = +txt;
              //pickingLineIds.push(pickingLineId);
              //console.error(error.txt);
              console.log("Pickings for each product group was created.");
              this.pickingsCreated(true);
              console.log(pickingLineIds);
              const odooPickingLinkUrl =
                this.middleManUrl + "/api/linkPickingToOrder";
              //pickingLineIds.forEach((pickingId) => {
              var linkingBody = {
                pickingId: pickingLineId,
                orderId: order.orderNumber,
              };
              const linkBodyJSON = JSON.stringify(linkingBody);
              this.http.post(odooPickingLinkUrl, linkBodyJSON).subscribe(
                (val) => {
                  console.log("link made?");
                },
                (error) => {
                  console.log("link made in error statement");
                  this.pickingsLinked(true);

                  //now take this picking and validate it!
                  const odooPickingValidateLinkUrl =
                    this.middleManUrl + "/api/validatePicking";
                  this.http
                    .post(odooPickingValidateLinkUrl, linkBodyJSON)
                    .subscribe(
                      (val) => {
                        console.log("picking validated?");
                        //this.validateOrder(order);
                      },
                      (error) => {
                        console.log("picking validated via error?");
                        this.validateOrder(order);
                      },
                    );
                },
              );
              //});
            },
          );

          //this.sendProducts(order, offlineOrder, order.amountPaid);
        }
      },
      (error) => {
        console.error(error);
      },
    );
  }

  validateOrder(order) {
    const odooUrl = this.middleManUrl + "/api/validateOrder"; // Replace with your Odoo instance URL

    var odooStyleOrder: any = {
      orderId: order.orderNumber,
    };
    console.log(odooStyleOrder);
    const body = JSON.stringify(odooStyleOrder);
    this.http.post(odooUrl, body).subscribe(
      (val) => {
        console.log("order set to paid?");
      },
      (error) => {
        console.log("order set to paid? ERROR?");
        this.orderComplete(order);
      },
    );
  }
}
