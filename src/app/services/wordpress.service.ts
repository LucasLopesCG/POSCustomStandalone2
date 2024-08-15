import { Injectable, OnInit } from "@angular/core";
import * as util from "util";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { customerService } from "./customerService";
import { userService } from "./userService";
import { debug } from "console";

@Injectable({
  providedIn: "root",
})
export class WordPressService implements OnInit {
  private apiUrl =
    "https://woocommerce-1248616-4474056.cloudwaysapps.com/wp-json"; // Replace with your WordPress site URL
  // Database credentials
  dbHost = "https://woocommerce-1248616-4474056.cloudwaysapps.com/";
  dbUsername = "pzvwhbwaey";
  dbPassword = "S7vuF8Tnjd";
  dbName = "pzvwhbwaey";

  private wordpressUserList = new BehaviorSubject<any>({});
  private wordpressStoreList = new BehaviorSubject<any>({});
  private announcements = new BehaviorSubject<any>({});

  // Observable string stream
  wordpressUserList$ = this.wordpressUserList.asObservable();
  wordpressStoreList$ = this.wordpressStoreList.asObservable();
  announcements$ = this.announcements.asObservable();

  constructor(
    private http: HttpClient,
    private customerService: customerService,
    private userService: userService,
  ) {
    userService.dataUser$.subscribe((val) => {
      // ("USER VALUE UPDATED!!");
      // (this.user);
      console.log(val);
      //debugger;
      if (!val) {
        this.getAnnouncements();
      }
    });
  }
  ngOnInit(): void {
    this.getAnnouncements();
    //throw new Error("Method not implemented.");
  }

  setWordPressUserList(val) {
    this.wordpressUserList.next(val);
  }

  setWordPressStoreList(val) {
    this.wordpressStoreList.next(val);
  }

  getAllUsers() {
    const username = "chronictest";
    const password = "GuruGuru24";
    const credentials = btoa(`${username}:${password}`);
    const headers1 = new HttpHeaders({
      Authorization: `Basic ${credentials}`,
    });

    let headers = {
      Authorization: "Basic Y2hyb25pY3Rlc3Q6R3VydUd1cnUyNA==",
    };

    this.http
      .get(this.apiUrl + "/poscustom/v1/users/getallUsers", { headers })
      .subscribe(
        (response) => {
          this.setWordPressUserList(response);
        },
        (error) => {
          console.error("An error occurred:", error);
        },
      );

    //return this.http.get(this.apiUrl + "/poscustom/v1/getallUsers");
    //return this.http.get("/wp-json/poscustom/v1/getallUsers", { headers });
  }

  getAnnouncements() {
    const username = "chronictest";
    const password = "GuruGuru24";
    const credentials = btoa(`${username}:${password}`);
    const headers1 = new HttpHeaders({
      Authorization: `Basic ${credentials}`,
    });

    let headers = {
      Authorization: "Basic Y2hyb25pY3Rlc3Q6R3VydUd1cnUyNA==",
    };

    this.http
      .get(this.apiUrl + "/poscustom/v1/stores/getAnnouncements", { headers })
      .subscribe(
        (response) => {
          this.announcements.next(response);
        },
        (error) => {
          console.error("An error occurred:", error);
        },
      );

    //return this.http.get(this.apiUrl + "/poscustom/v1/getallUsers");
    //return this.http.get("/wp-json/poscustom/v1/getallUsers", { headers });
  }

  getAllStores() {
    const username = "chronictest";
    const password = "GuruGuru24";
    const credentials = btoa(`${username}:${password}`);
    const headers1 = new HttpHeaders({
      Authorization: `Basic ${credentials}`,
    });

    let headers = {
      Authorization: "Basic Y2hyb25pY3Rlc3Q6R3VydUd1cnUyNA==",
    };

    this.http
      .get(this.apiUrl + "/poscustom/v1/stores/getallstores", { headers })
      .subscribe(
        (response) => {
          this.setWordPressStoreList(response);
        },
        (error) => {
          console.error("An error occurred:", error);
        },
      );

    //return this.http.get(this.apiUrl + "/poscustom/v1/getallUsers");
    //return this.http.get("/wp-json/poscustom/v1/getallUsers", { headers });
  }

  addNewUser(newUser) {
    this.http
      .post(this.apiUrl + "/poscustom/v1/users/addUser", newUser)
      .subscribe(
        (response) => {
          this.getAllUsers();
        },
        (error) => {
          console.error("An error occurred:", error);
        },
      );
  }

  updateUser(user) {
    this.http
      .put(this.apiUrl + "/poscustom/v1/users/editUser/" + user.id, user)
      .subscribe(
        (response) => {
          this.getAllUsers();
        },
        (error) => {
          console.error("An error occurred:", error);
        },
      );
  }

  updateStore(store) {
    this.http
      .put(this.apiUrl + "/poscustom/v1/stores/editStore/" + store.id, store)
      .subscribe(
        (response) => {
          this.getAllStores();
        },
        (error) => {
          console.error("An error occurred:", error);
        },
      );
  }

  deleteUser(user) {
    this.http
      .delete(this.apiUrl + "/poscustom/v1/users/deleteUser/" + user.id, user)
      .subscribe(
        (response) => {
          this.getAllUsers();
        },
        (error) => {
          console.error("An error occurred:", error);
        },
      );
  }

  getGuruBucksForCustomer(email) {
    var guruBucksTotal: number = 0;
    this.http
      .get(
        this.apiUrl + "/poscustom/v1/customers/getCustomerById/" + email.email,
      )
      .subscribe(
        (response) => {
          var response2: any = response;
          //now go through each guru_bucks record. Add up the points_balance for each record.
          if (response2.guru_bucks.length > 0) {
            response2.guru_bucks.forEach((gb) => {
              var gbBalance: number = +gb.points_balance;
              guruBucksTotal = (guruBucksTotal + gbBalance) as number;
            });
            this.customerService.updatecustomerWithWPUserId(
              response2.customer.user_id,
            );
            this.customerService.updateCustomerWithGuruBucks(guruBucksTotal);
          }
        },
        (error) => {
          console.error(
            "An error occurred: Odoo Customer has no account on WooCommerce",
            error,
          );
        },
      );
  }

  deductGuruBucksFromCustomer(order) {
    const url = this.apiUrl + "/poscustom/v1/customers/guruBucksBalanceUpdate"; // Replace with your Odoo instance URL
    var gbUpdateBody: any = {
      id: order.customer.wpUserId,
      balance: order.guruBucksUsed * -1,
    };
    this.http.post(url, gbUpdateBody).subscribe((response) => {});
  }

  addGuruBucksToCustomer(order) {
    const url = this.apiUrl + "/poscustom/v1/customers/guruBucksBalanceUpdate";
    var gbUpdateBody: any = {
      id: order.customer.wpUserId,
      balance: order.total / order.taxRate + 1,
    };
    this.http.post(url, gbUpdateBody).subscribe((response) => {});
  }
}
