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

@Injectable({
  providedIn: "root",
})
export class OdooService implements OnInit {
  odooPastOrderArray: any = [];
  odooPastOrderLineArray: any = [];

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
  private odooUrl = "https://chronicguru-staging-lucas-12985506.dev.odoo.com"; // replace with your odoo instance URL
  private middleManUrl =
    "https://phpstack-1248616-4634628.cloudwaysapps.com/controllers";
  private db = "chronicguru-staging-lucas-12985506"; // replace with your database name
  private username = "gary@chronicguru.com"; // replace with your username
  private password = "0fe534d0cffccd509e8525930f8d7d4ba7439f18"; // replace with your password
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

  TESTIMAGE() {
    return this.http.get(
      "https://chronicguru.odoo.com/web/image/5802?unique=3b11c3a2adda4ae6ba4b7bde0816439db38c5854",
      { responseType: "blob" },
    );
  }

  getAuth() {}
  /**
   * CURRENTLY BUGGED, CORS ISSUE
   * Retrieves all available product information. This is a test call.
   */

  getProductsFromMiddleMan() {
    var body: any = { data: "blah" };
    this.http.get(this.middleManUrl + "/getProducts").subscribe((s) => {
      //console.log(s);
      this.odooProducts.next(s);
    });
  }

  productsLoaded() {
    this.productLoadComplete.next(true);
  }
  stocksLoaded() {
    this.stockLoadComplete.next(true);
  }

  getPastOrdersFromMiddleMan() {
    var body: any = { data: "blah" };
    this.http.get(this.middleManUrl + "/getPastOrders").subscribe((s) => {
      console.log(s);
      this.pastOrders.next(s);
    });
  }

  getCustomersFromMiddleMan() {
    var body: any = { data: "blah" };
    this.http.get(this.middleManUrl + "/getCustomers").subscribe((s) => {
      console.log(s);
      this.customers.next(s);
    });
  }

  submitNewCustomer(newCustomer: any) {
    const odooUrl =
      "https://phpstack-1248616-4634628.cloudwaysapps.com/api/createcustomer"; // Replace with your Odoo instance URL

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

  getCombinedProductData(stockFilter: string) {
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");
    headers.append("Origin", "http://localhost:3000");

    this.http
      .get(
        `https://phpstack-1248616-4634628.cloudwaysapps.com/api/combinedProductData?stockFilter=${stockFilter}`,
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

    this.http
      .get("https://phpstack-1248616-4634628.cloudwaysapps.com/api/products")
      .subscribe(
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

    this.http
      .get("https://phpstack-1248616-4634628.cloudwaysapps.com/api/stocks")
      .subscribe(
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

    this.http
      .get(
        " https://phpstack-1248616-4634628.cloudwaysapps.com/api/priceListRule",
      )
      .subscribe(
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

    this.http
      .get(" https://phpstack-1248616-4634628.cloudwaysapps.com/api/customers")
      .subscribe(
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

    this.http
      .get("https://phpstack-1248616-4634628.cloudwaysapps.com/api/pastOrders")
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

  getPastOrderLines() {
    let headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");
    headers.append("Origin", "http://localhost:3000");

    this.http
      .get(
        "https://phpstack-1248616-4634628.cloudwaysapps.com/api/pastOrderLines",
      )
      .subscribe(
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
    const odooUrl =
      "https://phpstack-1248616-4634628.cloudwaysapps.com/api/order-line"; // Replace with your Odoo instance URL

    var lines: Array<any> = [];
    var total = order.total as number;
    var taxRate = order.taxRate as number;
    var amountPaid = order.amountPaid as number;
    var amountTaxed = total - total / (1 + taxRate);
    var config_id: number = 0;
    var fiscal_position_id: number = 0;

    if (this.selectedLocation) {
      if (this.selectedLocation.location == storeLocationEnum.Apopka) {
        config_id = 1;
        fiscal_position_id = 2;
      }
      if (this.selectedLocation.location == storeLocationEnum.DeLand) {
        config_id = 4;
        fiscal_position_id = 4;
      }
      if (this.selectedLocation.location == storeLocationEnum.Orlando) {
        config_id = 3;
        fiscal_position_id = 5;
      }
      if (this.selectedLocation.location == storeLocationEnum.Sanford) {
        config_id = 2;
        fiscal_position_id = 1;
      }
    }
    if (order && order.products && order.products.length > 0) {
      order.products.forEach((product) => {
        var price = product.product.price as number;
        var newLine: any = {
          product_id: product.product.id,
          product_name: product.product.name,
          quantity: product.count,
          price_unit: price,
          total_price: price * product.count,
        };
        lines.push(newLine);
      });
    }
    var odooStyleOrder: any = {
      amount_tax: amountTaxed,
      amount_total: total,
      amount_paid: amountPaid,
      amount_return: amountPaid - total,
      session_id: 599,
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
        //TO-DO: FIX THIS FUNCTION SO THAT ORDER KEEPS TRACK OF HOW MUCH WAS PAID TO THE ORDER.
        var responseVal = response as unknown;
        order.orderNumber = responseVal as number;
        this.currentOrderService.setCurrentOrder(order);
        this.sendProducts(order, offlineOrder);
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

  sendProducts(order, offlineOrder) {
    const odooUrl =
      "https://phpstack-1248616-4634628.cloudwaysapps.com/api/order-pay"; // Replace with your Odoo instance URL

    var odooStyleOrder: any = {
      config_id: 1,
      paymentMethodId: 1,
      amount: 0.0,
      orderId: order.orderNumber,
    };
    console.log(odooStyleOrder);
    const body = JSON.stringify(odooStyleOrder);

    this.http.put(odooUrl, body).subscribe(
      (response) => {
        //this.pas.next(response);
        console.log(response);
        //since it actually went through, tell offline mode to start dumping orders by recursively calling this function.
        //TO-DO: FIX THIS FUNCTION SO THAT ORDER KEEPS TRACK OF HOW MUCH WAS PAID TO THE ORDER.
        var responseVal = response as unknown;
        order.orderNumber = responseVal as number;
        this.currentOrderService.setCurrentOrder(order);
        this.sendProducts(order, offlineOrder);
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
}
