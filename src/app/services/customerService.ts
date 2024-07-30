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

  customer: customer = { name: " " };
  availableCustomersList: Array<any> = [];

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

  updateCustomerWithGuruBucks(guruBucks) {
    this.customer.guruBucks = guruBucks;
    this.selectedCustomer.next(this.customer);
  }

  updatecustomerWithWPUserId(id) {
    this.customer.wpUserId = id;
    this.selectedCustomer.next(this.customer);
  }

  public setCustomers(val) {
    this.availableCustomers.next(val);
  }

  public addNewCustomer(val: customer) {
    this.availableCustomersList.unshift(val);
    this.availableCustomers.next(this.availableCustomersList);
  }
  public updateLastCustomer(id: number) {
    this.availableCustomersList[this.availableCustomersList.length - 1].id = id;
    this.availableCustomers.next(this.availableCustomersList);
  }
}
