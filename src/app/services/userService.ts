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
import { order } from "../models/order";
import { OdooService } from "./odoo.service";

@Injectable({
  providedIn: "root",
})
export class userService {
  user = { name: " " };
  sessionDataArray: Array<order> = [];
  sessionCashTracker: number = 0;

  // Observable string source
  private dataUser = new BehaviorSubject<User>({});
  private sessionData = new BehaviorSubject<Array<order>>([]);
  private cashRegisterAmt = new BehaviorSubject<number>(0);

  // Observable string stream
  dataUser$ = this.dataUser.asObservable();
  sessionData$ = this.sessionData.asObservable();
  cashRegisterAmt$ = this.cashRegisterAmt.asObservable();

  constructor() {
    this.sessionData$.subscribe((val) => {
      this.sessionDataArray = val;
      //odooService.getTaxRates();
    });
    this.cashRegisterAmt$.subscribe((val) => {
      this.sessionCashTracker = val;
    });
  }

  public setCurrentUser(value) {
    // ("save data function called " + value + this.user.name);
    this.user = value;
    this.dataUser.next(this.user);
    //this.odooService.getTaxRates();
  }

  public newSession() {
    this.sessionCashTracker = 0;
    this.sessionData.next([]);
  }

  public addOrderToSessionData(val) {
    this.sessionDataArray.push(val);
    this.sessionData.next(this.sessionDataArray);
  }

  public addToRegister(val) {
    this.sessionCashTracker = this.sessionCashTracker + val;
    this.cashRegisterAmt.next(this.sessionCashTracker);
  }
}
