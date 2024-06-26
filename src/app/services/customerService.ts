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
import { User } from "../models/user";

import { HttpClient } from "@angular/common/http";
import { customer } from "../models/customer";
import { OdooService } from "./odoo.service";

@Injectable({
  providedIn: "root",
})
export class customerService {
  // declare and initialize the quote property
  // which will be a BehaviorSubject
  //   user = new BehaviorSubject({});

  //   // expose the BehaviorSubject as an Observable
  //   currentUser = this.user.asObservable();

  //   // function to update the value of the BehaviorSubject
  //   setCurrentUser(newUser: User){
  //     this.user.next(newUser);
  //     //this.currentUser = this.user.asObservable();
  //      ("user got updated inside of userService");
  //   }

  customer = { name: " " };
  availableCustomersList: Array<customer> = [];

  // Observable string source
  private selectedCustomer = new BehaviorSubject<customer>({});
  private availableCustomers = new BehaviorSubject<Array<customer>>([]);

  // Observable string stream
  selectedCustomer$ = this.selectedCustomer.asObservable();
  availableCustomers$ = this.availableCustomers.asObservable();

  constructor() {
    this.availableCustomers$.subscribe((val) => {
      this.availableCustomersList = val;
    });
  }

  public setCurrentCustomer(value) {
    // ("save data function called " + value + this.customer.name);
    this.customer = value;
    this.selectedCustomer.next(this.customer);
  }

  public setCustomers(val) {
    this.availableCustomers.next(val);
  }

  public getCustomers() {
    var customer1 = {
      name: "Bruce Wayne",
      address: "01 Wayne Manor, Gotham",
      email: "totallyNotBatman@wayneTech.com",
      phone: "555-511-8626",
      mobile: "555-511-8626",
      notes: ["might be batman", "loaded"],
    };
    var customer2 = {
      name: "Clark Kent",
      address: "555 Penthouse For Journalists, Metropolis",
      email: "leadPipeJournalist@dailyPlanet.com",
      phone: "555-522-8626",
      mobile: "555-522-8626",
      notes: ["might be superman", "loaded"],
    };
    this.availableCustomers.next([customer1, customer2]);
  }
  public addNewCustomer(val: customer) {
    this.availableCustomersList.push(val);
    this.availableCustomers.next(this.availableCustomersList);
  }
  public updateLastCustomer(id: number) {
    this.availableCustomersList[this.availableCustomersList.length - 1].id = id;
    this.availableCustomers.next(this.availableCustomersList);
  }
}
