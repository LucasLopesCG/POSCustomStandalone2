import { Injectable } from "@angular/core";
import * as util from "util";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class WordPressService {
  private apiUrl =
    "https://woocommerce-1248616-4474056.cloudwaysapps.com/wp-json"; // Replace with your WordPress site URL
  // Database credentials
  dbHost = "https://woocommerce-1248616-4474056.cloudwaysapps.com/";
  dbUsername = "pzvwhbwaey";
  dbPassword = "S7vuF8Tnjd";
  dbName = "pzvwhbwaey";

  private wordpressUserList = new BehaviorSubject<any>({});
  private wordpressStoreList = new BehaviorSubject<any>({});

  // Observable string stream
  wordpressUserList$ = this.wordpressUserList.asObservable();
  wordpressStoreList$ = this.wordpressStoreList.asObservable();

  constructor(private http: HttpClient) {}

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
}
