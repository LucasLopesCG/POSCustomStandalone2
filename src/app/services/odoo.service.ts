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
import { WordPressService } from "./wordpress.service";
import { userService } from "./userService";

@Injectable({
  providedIn: "root",
})
export class OdooService implements OnInit {
  odooPastOrderArray: any = [];
  odooPastOrderLineArray: any = [];
  customersArray: any = [];
  storeConfigId: number = 0;
  availablePaymentMethodIds: Array<number> = [];
  POSSessionStatesFinalArray: Array<any> = [];
  currentCashier: any = {};
  selectedTaxId: any = {};

  private sessionId = new BehaviorSubject<number>(599);
  private configIds = new BehaviorSubject<any>({});
  private taxRates = new BehaviorSubject<any>({});
  private POSSessionStates = new BehaviorSubject<any>({});
  private POSSessionStatesFinal = new BehaviorSubject<any>({});
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
  private priceListData = new BehaviorSubject<any>({});
  private pastOrderConfigIds = new BehaviorSubject<Array<number>>([]);
  private pastOrderCount = new BehaviorSubject<any>({});
  private productStockInfo = new BehaviorSubject<any>({});

  sessionId$ = this.sessionId.asObservable();
  configIds$ = this.configIds.asObservable();
  taxRates$ = this.taxRates.asObservable();
  POSSessionStates$ = this.POSSessionStates.asObservable();
  POSSessionStatesFinal$ = this.POSSessionStatesFinal.asObservable();
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
  priceListData$ = this.priceListData.asObservable();
  pastOrderConfigIds$ = this.pastOrderConfigIds.asObservable();
  pastOrderCount$ = this.pastOrderCount.asObservable();
  productStockInfo$ = this.productStockInfo.asObservable();

  selectedLocation: any = null;
  sessionIdVal;
  session_data: any = null;
  config: odooInfo = { url: "", port: "", username: "", password: "", db: "" };
  host: string | null = "";
  port: string | null = "";
  secure: boolean = false;
  uid: any = 0;
  POSStatusArray: Array<any> = [];
  private middleManUrl = "https://phpstack-1248616-4634628.cloudwaysapps.com";
  headers = new HttpHeaders({
    "Content-Type": "text/xml",
  });

  constructor(
    private http: HttpClient,
    private offlineMode: offlineModeService,
    private storeService: storeService,
    private currentOrderService: CurrentOrderService,
    private wordpressService: WordPressService,
    private userService: userService,
  ) {
    userService.dataUser$.subscribe((val) => {
      this.currentCashier = val;
    });
    this.storeService.taxRateIdForStore$.subscribe((val) => {
      this.selectedTaxId = val;
    });
    this.storeService.availablePaymentMethods$.subscribe((val) => {
      this.availablePaymentMethodIds = val;
    });
    this.storeService.configIdForCurrentStore$.subscribe((val) => {
      this.storeConfigId = val;
    });
    this.pastOrders$.subscribe((val) => {
      //save this value and call the other service to pull lines
      if (val && val.length > 0) {
        this.odooPastOrderArray = val;
        //this.getPastOrderLines();
        this.storeService.setPastOrdersForStore(this.odooPastOrderArray);
      }
    });
    this.POSSessionStates$.subscribe((val) => {
      if (val && val.length > 0) this.POSStatusArray = val;
    });
    this.POSSessionStatesFinal$.subscribe((val) => {
      if (val && val.length > 0) this.POSSessionStatesFinalArray = val;
    });
    storeService.dataSelectedStoreLocation$.subscribe((val) => {
      this.selectedLocation = val;
      //Run logic here to gather information of the locations the user has access to:
    });
    this.sessionId$.subscribe((val) => {
      this.sessionIdVal = val;
    });
  }
  ngOnInit(): void {}

  getPOSConfigIds() {
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");
    headers.append("Origin", "http://localhost:3000");

    this.http.get(this.middleManUrl + "/api/getPOSConfigIds").subscribe(
      (response) => {
        console.log("Response:", response);
        this.configIds.next(response);
      },
      (error) => {
        console.log("Error:", error);
        var errorDecode = error.error.text.toString();
        var errorDecode2 = errorDecode.split("null");
        var errorDecode3 = errorDecode2[1];
        var errorDecode4 = JSON.parse(errorDecode3);
        this.configIds.next(errorDecode4);
      },
    );
  }

  getPOSStatusByIdOG(id: string) {
    this.http
      .get(this.middleManUrl + `/api/getPOSStatusById?id=${id}`)
      .subscribe(
        (response) => {
          //console.log("Response:", response);
          var matchFound: boolean = false;
          if (this.POSStatusArray && this.POSStatusArray.length > 0) {
            this.POSStatusArray.forEach((POSStatus) => {
              if (POSStatus.id == id) {
                matchFound = true;
                if (response[0].state == "closed") {
                  POSStatus.inUse = false;
                  POSStatus.cashInRegister =
                    response[0].cash_register_balance_end_real;
                } else {
                  POSStatus.inUse = true;
                  POSStatus.sessionId = response[0].id;

                  var messageContents: Array<any> = [];
                  //this thing contains a list of message Ids, which I now need to load from the system.
                  if (response[0].message_ids.length > 0) {
                    response[0].message_ids.forEach((messageId) => {
                      this.http
                        .get(
                          this.middleManUrl +
                            `/api/getMessageById?id=${messageId}`,
                        )
                        .subscribe((response) => {
                          var message = response[0].preview as string;
                          //messageContents.push(response[0].preview as string);
                          if (message.includes("POSC - Session opened by -")) {
                            POSStatus.cashier = message
                              .split("POSC - Session opened by -")[1]
                              .replace(/\s/g, "");
                          }
                        });
                    });
                  }
                }
              }
            });
          }
          if (!matchFound) {
            var newStatus: any = {};
            newStatus.id = id;
            newStatus.defaultPriceList = response[0].pricelist_id;
            newStatus.availablePriceLists = response[0].available_pricelist_ids;
            newStatus.availableTaxRates = response[0].fiscal_position_ids;
            newStatus.sessionId = response[0].id;
            if (response[0].state == "closed") {
              newStatus.inUse = false;
              newStatus.cashInRegister =
                response[0].cash_register_balance_end_real;
            } else {
              newStatus.cashInRegister =
                response[0].cash_register_balance_start;
              newStatus.order_ids = response[0].order_ids;
              newStatus.inUse = true;
              var flipFound: boolean = false;
              var messageContents: Array<any> = [];
              //this thing contains a list of message Ids, which I now need to load from the system.
              if (response[0].message_ids.length > 0) {
                response[0].message_ids.forEach((messageId) => {
                  this.http
                    .get(
                      this.middleManUrl + `/api/getMessageById?id=${messageId}`,
                    )
                    .subscribe((response) => {
                      var message = response[0].preview as string;
                      //messageContents.push(response[0].preview as string);
                      if (message.includes("POSC - Session Opened By -")) {
                        newStatus.cashier = message
                          .split("POSC - Session Opened By -")[1]
                          .replace(/\s/g, "");
                        flipFound = true;
                      }
                    });
                });
              }

              if (!flipFound) {
                newStatus.cashier = response[0].user_id[1];
              }
            }
            this.POSStatusArray.push(newStatus);
          }
          this.POSSessionStates.next(this.POSStatusArray);
        },
        (error) => {
          //console.log("Error:", error);
        },
      );
  }

  getPOSStatusById(id: string) {
    this.http
      .get(this.middleManUrl + `/api/getPOSStatusById?id=${id}`)
      .subscribe((response) => {
        var matchFound: boolean = false;
        if (this.POSStatusArray && this.POSStatusArray.length > 0) {
          this.POSStatusArray.forEach((POSStatus) => {
            if (POSStatus.id == id) {
              matchFound = true;
              if (response[0].state == "closed") {
                POSStatus.inUse = false;
                POSStatus.cashInRegister =
                  response[0].cash_register_balance_end_real;
              } else {
                POSStatus.cashier = response[0].user_id[1];
                POSStatus.inUse = true;
                POSStatus.sessionId = response[0].id;

                var messageContents: Array<any> = [];
                //this thing contains a list of message Ids, which I now need to load from the system.
              }
            }
          });
        }
        if (!matchFound) {
          var newStatus: any = {};
          newStatus.id = id;
          newStatus.defaultPriceList = response[0].pricelist_id;
          newStatus.availablePriceLists = response[0].available_pricelist_ids;
          newStatus.availableTaxRates = response[0].fiscal_position_ids;
          newStatus.sessionId = response[0].id;
          if (response[0].state == "closed") {
            newStatus.inUse = false;
            newStatus.cashInRegister =
              response[0].cash_register_balance_end_real;
          } else {
            newStatus.cashInRegister = response[0].cash_register_balance_start;
            newStatus.order_ids = response[0].order_ids;
            newStatus.cashier = response[0].user_id[1];
            newStatus.inUse = true;
            var flipFound: boolean = false;
            var messageContents: Array<any> = [];
            //this thing contains a list of message Ids, which I now need to load from the system.
            if (response[0].message_ids.length > 0) {
              newStatus.messagesToScan = response[0].message_ids;
            }
          }
          this.POSStatusArray.push(newStatus);
        }
        this.POSSessionStates.next(this.POSStatusArray);
      });
  }

  updatePOSSessionState(state: any, messageId) {
    //call the function to fetch the message.
    //see if the message includes the "POSC - Session Opened By -" string
    //if so, find the record within POSSessionStates$ value, and change it to be new. Then update a new observable that I then need to subscribe too
    //otherwise it will go in an endless loop
    this.http
      .get(this.middleManUrl + `/api/getMessageById?id=${messageId}`)
      .subscribe((response) => {
        var message = response[0].preview as string;
        //messageContents.push(response[0].preview as string);
        if (message.includes("POSC - Session Opened By -")) {
          state.cashier = message
            .split("POSC - Session Opened By -")[1]
            .replace(/\s/g, "");
          //now add this new state into a new observable (which will add them all up)

          this.POSStatusArray.forEach((session) => {
            if (session.sessionId == state.sessionId) {
              var sessionCopy = structuredClone(session);
              sessionCopy.cashier = state.cashier;
              this.POSSessionStatesFinalArray.push(sessionCopy);
            }
          });
          this.POSSessionStatesFinal.next(this.POSSessionStatesFinalArray);
        }
      });
  }
  updatePOSSessionStateWithOdooPOS(state) {
    this.POSStatusArray.forEach((session) => {
      if (session.sessionId == state.sessionId) {
        var sessionCopy = structuredClone(session);
        sessionCopy.cashier = state.cashier;
        this.POSSessionStatesFinalArray.push(sessionCopy);
      }
    });
    this.POSSessionStatesFinal.next(this.POSSessionStatesFinalArray);
  }

  createSession(configId, userId, cashStart, cashier) {
    const odooUrl = this.middleManUrl + "/api/createPOSSession"; // Replace with your Odoo instance URL
    var odooSession: any = {
      configId: configId,
      userId: userId,
      cashStart: cashStart,
      openingNote: "Opened By -" + cashier,
    };
    const body = JSON.stringify(odooSession);
    this.http.put(odooUrl, body).subscribe(
      (response) => {
        var responseNum = +response;
        //this.pas.next(response);
        //console.log(response);
        this.sessionId.next(responseNum);
        this.addPOSMessageToSession(responseNum, cashier);
        // update the customer on local side to have this newly created id, saving a get call
      },
      (error) => {
        console.error(error);
      },
    );
  }

  checkOrderAmountsById(orderId) {
    return this.http.get(
      this.middleManUrl + `/api/checkOrderAmountsById?id=${orderId}`,
    );
  }

  setSessionId(id) {
    this.sessionId.next(id);
  }

  addPOSMessageToSession(sessionId, cashier) {
    const odooUrl = this.middleManUrl + "/api/createSessionMessage"; // Replace with your Odoo instance URL
    var odooSession: any = {
      body: "POSC - Session Opened By - " + cashier,
      sessionId: sessionId,
    };
    const body = JSON.stringify(odooSession);
    this.http.put(odooUrl, body).subscribe(
      (response) => {
        //console.log(response);
      },
      (error) => {
        console.error(error);
      },
    );
  }

  closeSession(sessionId, amt) {
    const odooUrl = this.middleManUrl + "/api/closeSession"; // Replace with your Odoo instance URL
    var odooSession: any = {
      id: sessionId,
      cash_register_balance_end_real: amt,
    };
    const body = JSON.stringify(odooSession);
    this.http.post(odooUrl, body).subscribe(
      (response) => {
        if (response == true) this.sessionId.next(-1);
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
    const odooUrl = this.middleManUrl + "/api/createCustomer"; // Replace with your Odoo instance URL

    var odooCustomer: any = {
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      mobile: newCustomer.mobile,
      street: newCustomer.address.split(",")[0],
      city: newCustomer.address.split(",")[1],
      country_id: 233, // Assuming country_id is an integer representing the country in Odoo - 233 being united states
    };
    //console.log(odooCustomer);
    const body = JSON.stringify(odooCustomer);

    this.http.put(odooUrl, body).subscribe(
      (response) => {
        //this.pas.next(response);
        //console.log(response);
        // update the customer on local side to have this newly created id, saving a get call
        this.getCustomers();
      },
      (error) => {
        console.error(error);
        this.getCustomers();
      },
    );
  }

  wipeProductData() {
    this.combinedProductData.next([]);
  }

  getCombinedProductData(stockFilter: string, priceList: number) {
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");
    headers.append("Origin", "http://localhost:3000");

    this.http
      .get(
        this.middleManUrl +
          `/api/combinedProductData?stockFilter=${stockFilter}&&priceListId=${priceList}`,
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

  fetchPriceListNames() {
    this.http.get(this.middleManUrl + `/api/priceList`).subscribe(
      (response) => {
        //console.log("Response:", response);
        this.priceListData.next(response);
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

    this.http.get(this.middleManUrl + "/api/customerCount").subscribe(
      (response) => {
        //console.log("Response:", response);
        var value = response as number;
        if (value > 20000) {
          //call customers with offset to get the rest of the customers
          //step 0: Empty out the array that will track incoming calls
          this.customersArray = [];
          //step 1: Find out how many times I'll need to call it:
          var maxCallCount = Math.floor(value / 57185) + 1;
          var callCount = 0;
          while (callCount < maxCallCount) {
            var offsetValue = callCount * 57185;
            this.http
              .get(
                this.middleManUrl +
                  "/api/customersWithOffset?offset=${offsetValue}",
              )
              .subscribe(
                (response) => {
                  var response2: any = response;
                  //console.log("Response:", response);
                  if (
                    Object.prototype.toString.call(response2) ===
                    "[object Array]"
                  ) {
                    response2.forEach((res) => {
                      this.customersArray.push(res);
                    });
                  } else {
                    this.customersArray.push(response);
                  }
                  this.odooCustomerList.next(this.customersArray);
                },
                (error) => {
                  //console.log("Error:", error);
                },
              );

            callCount++;
          }
        } else {
          //just call the normal "customers"

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
      },
      (error) => {
        //console.log("Error:", error);
      },
    );
  }

  setPastOrderConfigs(inputArray) {
    this.pastOrderConfigIds.next(inputArray);
  }

  getPastOrderCount() {
    this.http.get(this.middleManUrl + `/api/pastOrderCount`).subscribe(
      (response) => {
        //console.log("Response:", response);
        this.pastOrderCount.next(response);
      },
      (error) => {
        //console.log("Error:", error);
      },
    );
  }

  addPastOrdersToList(inputArray, limit, offset, totalCalls) {
    this.http
      .get(
        this.middleManUrl +
          `/api/pastOrders?id=[${inputArray}]&limit=${limit}&offset=${offset}`,
      )
      .subscribe(
        (response) => {
          //console.log("Response:", response);
          this.addValuesToPastOrders(response);
          totalCalls--;
          if (totalCalls > 0) {
            this.addPastOrdersToList(
              inputArray,
              limit,
              offset + limit,
              totalCalls,
            );
          }
        },
        (error) => {
          //console.log("Error:", error);
        },
      );
  }

  addValuesToPastOrders(array) {
    array.forEach((item) => {
      this.odooPastOrderArray.push(item);
    });
    this.pastOrders.next(this.odooPastOrderArray);
  }

  /**
   *
   * @param customer the customer information we will use to filter order results by
   * NEED TO IMPLEMENT
   * Retrieve all orders for the currently selected customer. Used by past orders modal component (by look-up).
   */
  getPastOrdersForCustomers(inputArray) {
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");
    headers.append("Origin", "http://localhost:3000");

    this.http
      .get(this.middleManUrl + `/api/pastOrders?id=${inputArray}`)
      .subscribe(
        (response) => {
          //console.log("Response:", response);
          this.pastOrders.next(response);
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
    order.sessionId = this.sessionIdVal;
    // if (this.session_data == null) {
    //   this.getAuth();
    // }
    order.cashier = this.currentCashier.name;
    const odooUrl = this.middleManUrl + "/api/order-line"; // Replace with your Odoo instance URL
    //debugger;
    var lines: Array<any> = [];
    var total = order.total as number;
    var taxRate = order.taxRate as number;
    var totalPurchasePaid = order.totalPaid;
    var totalPurchasePaidTax = order.totalPaidTax;
    var amountPaid = order.amountPaid as number;
    var amountTaxed = total - total / (1 + taxRate);
    //var config_id: number = 0;
    var fiscal_position_id: number = 0;
    var paymentMethodId: number = 0;

    if (this.selectedLocation) {
      if (this.selectedLocation.location == storeLocationEnum.Apopka) {
        //config_id = 1;
        fiscal_position_id = 2;
        paymentMethodId = 1;
      }
      if (this.selectedLocation.location == storeLocationEnum.DeLand) {
        //config_id = 4;
        fiscal_position_id = 4;
        paymentMethodId = 7;
      }
      if (this.selectedLocation.location == storeLocationEnum.Orlando) {
        //config_id = 3;
        fiscal_position_id = 3;
        paymentMethodId = 8;
      }
      if (this.selectedLocation.location == storeLocationEnum.Sanford) {
        //config_id = 2;
        fiscal_position_id = 1;
        paymentMethodId = 5;
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
              price_subtotal_incl: price * taxRate + price,
              total_price: price * product.count,
              customer_note: product.note,
            };
            if (!newLine.customer_note) {
              newLine.customer_note = "";
            }
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
                price_subtotal_incl: price * taxRate + price,
                total_price: price * product.count,
                customer_note: product.note,
              };
              if (!newLine.customer_note) {
                newLine.customer_note = "";
              }
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
            price_subtotal_incl: couponPrice * taxRate + couponPrice,
            total_price: couponPrice,
            customer_note: product.note,
          };
          if (!couponLine.customer_note) {
            couponLine.customer_note = "";
          }
          lines.push(couponLine);
        }
      });
      if (order && order.bxgoProducts && order.bxgoProducts.length > 0) {
        order.bxgoProducts.forEach((product) => {
          var bxgoLine: any = {
            product_id: product.id,
            product_name: product.name + " Free due to BXGO",
            quantity: 1,
            price_unit: 0,
            price_subtotal_incl: 0 * taxRate + 0,
            total_price: 0,
            customer_note: "Free due to BXGO",
          };
          lines.push(bxgoLine);
        });
      }
    }
    if (
      order &&
      order.coupon &&
      order.coupon[0] &&
      order.coupon[0].couponType &&
      order.coupon[0].couponType == couponTypeEnum.amountOffOrder
    ) {
      var newLine: any = {
        product_id: -1,
        product_name: order.coupon[0].couponDetail?.description as string,
        quantity: 1,
        price_unit: order.coupon[0].couponDetail?.setPrice as number,
        price_subtotal_incl:
          (order.coupon[0].couponDetail?.setPrice as number) * taxRate +
          (order.coupon[0].couponDetail?.setPrice as number),
        total_price: order.coupon[0].couponDetail?.setPrice as number,
      };
      lines.push(newLine);
    }

    if (order && order.guruBucksUsed && order.guruBucksUsed > 0) {
      var guruBucksLeft = order.guruBucksUsed;
      // Go through each existing lines record and start removing dollars from the price_unit value.
      //re-calculate the price_subtotal_incl and total_price fields.
      //re-name the "product_name" field to include (X dollars off from guru bucks)
      lines.forEach((line) => {
        var dollarsOff: number = 0;
        var productNameOriginal = line.product_name;
        while (line.price_unit > 1 && guruBucksLeft >= 20) {
          dollarsOff++;
          guruBucksLeft = guruBucksLeft - 20;
          line.price_unit = line.price_unit - 1;
          line.price_subtotal_incl =
            line.price_unit * taxRate + line.price_unit;
          line.total_price = line.price_unit;
          line.product_name =
            productNameOriginal +
            " ($" +
            dollarsOff +
            " Removed from product by Guru Bucks Rewards)";
        }
      });
    }

    if (
      order.coupon &&
      order.customer &&
      order.coupon &&
      order.coupon[0] &&
      order.coupon[0].couponType == couponTypeEnum.singleUsePerCustomer
    ) {
      //CHECK TO SEE IF FREEBIE WAS USED: SEND OUT TAG!
      var customerId = { customer_id: order.customer.id, tag_id: 1 };
      const odooTagUrl = this.middleManUrl + "/api/addTagToCustomer";
      const body2 = JSON.stringify(customerId);
      //send out order here to update the customer with the FREEBIE tag.
      this.http.post(odooTagUrl, body2).subscribe(
        (response) => {
          //console.log(response);
          console.log("customer should now have FREEBIE tag.");
        },
        (error) => {
          console.error(error);
        },
      );
    }

    //SEND OUT ORDER PROPER
    if (
      order.totalRefund &&
      order.totalPaid &&
      order.totalRefund >= order.totalPaid
    ) {
      order.amountPaid = order.totalPaid;
      order.total = order.amountPaid;
    }
    var odooStyleOrder: any = {
      amount_tax: (totalPurchasePaid as number) * taxRate,
      amount_total:
        (totalPurchasePaid as number) + (totalPurchasePaid as number) * taxRate,
      amount_paid:
        (totalPurchasePaid as number) + (totalPurchasePaid as number) * taxRate,
      amount_return: (order.amountPaid as number) - (order.total as number),
      session_id: order.sessionId,
      name: "POS_CUSTOM_ORDER",
      cashier: order.cashier,
      config_id: this.storeConfigId,
      fiscal_position_id: fiscal_position_id,
      tax_id: [this.selectedTaxId],
      lines: lines,
    };
    //debugger;
    if (order.customer) {
      odooStyleOrder.customerId = order.customer.id as number;
    } else {
      odooStyleOrder.customerId = "";
    }
    //console.log(odooStyleOrder);
    const body = JSON.stringify(odooStyleOrder);

    this.http.put(odooUrl, body).subscribe(
      (response) => {
        //this.pas.next(response);
        //console.log(response);
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
          this.storeConfigId,
          this.availablePaymentMethodIds[0],
          true,
        );
        if (change < 0) {
          this.PayAndDeductProducts(
            order,
            change,
            lines,
            this.storeConfigId,
            this.availablePaymentMethodIds[0],
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
    var fiscal_position_id: number = 0;
    if (this.selectedLocation) {
      if (this.selectedLocation.location == storeLocationEnum.Apopka) {
        //config_id = 1;
        fiscal_position_id = 2;
      }
      if (this.selectedLocation.location == storeLocationEnum.DeLand) {
        //config_id = 4;
        fiscal_position_id = 4;
      }
      if (this.selectedLocation.location == storeLocationEnum.Orlando) {
        //config_id = 3;
        fiscal_position_id = 3;
      }
      if (this.selectedLocation.location == storeLocationEnum.Sanford) {
        //config_id = 2;
        fiscal_position_id = 1;
      }
    }
    var odooStyleOrder: any = {};
    odooStyleOrder.id = order.refundOrderNumber;
    odooStyleOrder.cashier = order.cashier;
    odooStyleOrder.refundAmount = order.totalRefund as number;
    odooStyleOrder.refundAmount = odooStyleOrder.refundAmount * -1;
    (odooStyleOrder.config_id = this.storeConfigId),
      (odooStyleOrder.fiscal_position_id = fiscal_position_id),
      (odooStyleOrder.session_id = order.sessionId as number);
    odooStyleOrder.products = [];
    if (order && order.refundedProducts) {
      order.refundedProducts?.forEach((product) => {
        odooStyleOrder.products.push(product.id);
      });
    }
    if (order.customer) {
      odooStyleOrder.customerId = order.customer.id as number;
    }
    const body = JSON.stringify(odooStyleOrder);
    const odooUrl = this.middleManUrl + "/api/createRefundOrder"; // Replace with your Odoo instance URL
    this.http.put(odooUrl, body).subscribe(
      (response) => {
        //console.log("Success? This actually should not happen?");
      },
      (error) => {
        //console.log("refund order error?");
        //console.log("Refund order created... now validate the picking");
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
            //console.log("picking for refund validated?");
            this.validateOrder(linkingBody);
          },
          (error) => {
            //console.log("picking validated via error?");
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
    var order2 = structuredClone(order);
    var pickingLineIds: Array<number> = [];
    const odooUrl = this.middleManUrl + "/api/order-pay"; // Replace with your Odoo instance URL

    var odooStyleOrder: any = {
      config_id: config_id,
      paymentMethodId: paymentMethodId,
      amount: amount,
      orderId: order.orderNumber,
    };
    //debugger;
    //console.log(odooStyleOrder);
    const body = JSON.stringify(odooStyleOrder);

    this.http.put(odooUrl, body).subscribe(
      (response) => {
        //this.pas.next(response);
        //console.log(response);
        // a payment line was created. Now go through each product in the list and create the pickings for each:
        if (createPickings) {
          //console.log(
          //  "Actual payment processed, now create pickings for order",
          //);
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
              //console.log("Created a picking: ");
              //console.log(response);
              pickingLineIds.push(response as number);
              //console.log("Remember the id of this!");
            },
            (error) => {
              var txt = error.error.text;
              txt = txt.split(": ")[1];
              txt = txt.replace(/\D/g, "");
              var pickingLineId: number = +txt;
              //pickingLineIds.push(pickingLineId);
              //console.error(error.txt);
              //console.log("Pickings for each product group was created.");
              this.pickingsCreated(true);
              //console.log(pickingLineIds);
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
                  //console.log("link made?");
                },
                (error) => {
                  //console.log("link made in error statement");
                  this.pickingsLinked(true);

                  //now take this picking and validate it!
                  const odooPickingValidateLinkUrl =
                    this.middleManUrl + "/api/validatePicking";
                  this.http
                    .post(odooPickingValidateLinkUrl, linkBodyJSON)
                    .subscribe(
                      (val) => {
                        console.log("picking validated?");
                        this.validateOrder(order2);
                      },
                      (error) => {
                        console.log("picking validated via error?");
                        this.validateOrder(order2);
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
    //console.log(odooStyleOrder);
    const body = JSON.stringify(odooStyleOrder);
    this.http.post(odooUrl, body).subscribe(
      (val) => {
        //console.log("order set to paid?");
      },
      (error) => {
        //console.log("order set to paid? ERROR?");
        if (order.customer && order.customer.wpUserId) {
          this.wordpressService.deductGuruBucksFromCustomer(order);
          this.wordpressService.addGuruBucksToCustomer(order);
        }
        this.orderComplete(order);
      },
    );
  }

  getTaxRates() {
    const odooUrl = this.middleManUrl + "/api/getTaxRates"; // Replace with your Odoo instance URL
    this.http.get(odooUrl).subscribe(
      (val) => {
        this.taxRates.next(val);
      },
      (error) => {
        //console.log("COULD NOT GET TAX RATES");
      },
    );
  }

  getProductsAndStockBySearchString(name) {
    const odooUrl =
      this.middleManUrl + `/api/getProductsAndStockBySearchString?name=${name}`; // Replace with your Odoo instance URL
    this.http.get(odooUrl).subscribe(
      (val) => {
        this.productStockInfo.next(val);
      },
      (error) => {
        //console.log("COULD NOT GET TAX RATES");
      },
    );
  }
}
