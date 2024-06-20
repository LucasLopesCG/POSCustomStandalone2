import { Injectable, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { order } from "../models/order";
import { offlineModeService } from "./offlineMode.service";
import { storeLocationEnum } from "../models/storeLocation";
import { customer } from "../models/customer";
import { odooInfo } from "../models/odooInfo";
import { storeService } from "./storeService";

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
    this.TESTIMAGE().subscribe((blob) => {
      const objectURL = URL.createObjectURL(blob);
      this.testImageSub.next(objectURL);
      // Use the objectURL as the src attribute of the img element
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
    var body: any = { data: "blah" };
    this.http
      .put(this.middleManUrl + "/makeNewCustomer", body)
      .subscribe((s) => {
        console.log(s);
        this.customers.next(s);
      });
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

  getLoginAuth() {
    const headers = new HttpHeaders({
      "Content-Type": "text/xml",
    });
    const xml = `
  <?xml version="1.0"?>
  <methodCall>
    <methodName>login</methodName>
    <params>
      <param><value><string>your_database_name</string></value></param>
      <param><value><string>your_username</string></value></param>
      <param><value><string>your_password</string></value></param>
    </params>
  </methodCall>
`;

    this.http
      .post(this.odooUrl + "/xmlrpc/2/common", xml, {
        headers: headers,
        responseType: "text",
      })
      .subscribe(
        (response) => {
          const sessionId = response; // Store the session ID
        },
        (error) => {
          console.log("Error:", error);
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

  saveNewCustomer(newCust: customer) {
    const xml = `
  <?xml version="1.0"?>
  <methodCall>
    <methodName>execute_kw</methodName>
    <params>
      <param><value><string>your_database_name</string></value></param>
      <param><value><string>your_username</string></value></param>
      <param><value><string>your_password</string></value></param>
      <param><value><string>res.partner</string></value></param>
      <param><value><string>create</string></value></param>
      <param><value><struct>
        <member><name>name</name><value><string>John Doe</string></value></member>
        <member><name>email</name><value><string>johndoe@example.com</string></value></member>
        <member><name>phone</name><value><string>1234567890</string></value></member>
      </struct></value></param>
    </params>
  </methodCall>
`;

    this.http
      .post(this.odooUrl + "/xmlrpc/2/object", xml, {
        headers: this.headers,
        responseType: "text",
      })
      .subscribe(
        (response) => {
          console.log("Customer created:", response);
        },
        (error) => {
          console.log("Error:", error);
        },
      );
  }

  /**
   *
   * @param store the name of the store we are querying
   * queries odoo for products currently in stock at the location specified by the input
   */
  getProductsForStore(store: storeLocationEnum) {}

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
   * @param id ID of the order that we are searching
   * Used by past order modal component to fetch a specific order (via receipt)
   */
  getPastOrderByOrderId(id: number) {}

  /**
   *
   * @param store a string enum for a store location
   * LOGIC NEEDS TO ACTUALLY BE IMPLEMENTED
   * retrieves all orders completed over the course of the day for the given store input
   */
  getDailyOrdersForStore(store: storeLocationEnum) {}

  /**
   *
   * @param order order object containing products,refunds,customer information,cashier information,etc
   * Sends order generated by the system to odoo.
   * includes logic to send all offline orders if it suceeds in contacting odoo. Will likewise add to offline orders if it fails
   */
  sendNewOrder(
    order: order,
    amountPaid: number = 0,
    offlineOrder: boolean = false,
  ) {
    console.log(order);
    // if (this.session_data == null) {
    //   this.getAuth();
    // }
    const odooUrl =
      "https://phpstack-1248616-4634628.cloudwaysapps.com/api/order-line"; // Replace with your Odoo instance URL
    //console.log(order);
    /*

  {
    "amount_tax": 10.0,
    "amount_total": 37.80,
    "amount_paid": 50.0,
    "amount_return": 12.20,
    "session_id": "599",
    "name": "Order 2",
    "cashier": "LDL POS_Custom Cashier2",
    "lines": [
        {
            "product_id": 19248,
            "product_name": "Black Truffle (Pre-Roll)",
            "quantity": 2,
            "total_price": 27.80
        },
        {
            "product_id": 19739,
            "product_name": "Truffle Burger (OZ)",
            "quantity": 2,
            "total_price": 40.80
        }
    ]
}


    */
    var lines: Array<any> = [];
    var total = order.total as number;
    var taxRate = order.taxRate as number;
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
      amount_tax: total / (1 + taxRate),
      amount_total: total,
      amount_paid: amountPaid,
      amount_return: amountPaid - total,
      session_id: 599,
      name: "POS_CUSTOM_ORDER",
      cashier: order.cashier,
      lines: lines,
    };

    const body = JSON.stringify(odooStyleOrder);

    this.http.put(odooUrl, body).subscribe(
      (response) => {
        //this.pas.next(response);
        console.log(response);
        //since it actually went through, tell offline mode to start dumping orders by recursively calling this function.
        //TO-DO: FIX THIS FUNCTION SO THAT ORDER KEEPS TRACK OF HOW MUCH WAS PAID TO THE ORDER.
        this.offlineMode.removeOrderFromList(order);
        if (this.offlineMode.orderListArray.length > 0) {
          this.sendNewOrder(this.offlineMode.orderListArray[0], 0, true);
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
