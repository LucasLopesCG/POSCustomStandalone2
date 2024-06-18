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

@Injectable({
  providedIn: "root",
})
export class userService {
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

  user = { name: " " };
  sessionDataArray: Array<order> = [];

  // Observable string source
  private dataUser = new BehaviorSubject<User>({});
  private sessionData = new BehaviorSubject<Array<order>>([]);

  // Observable string stream
  dataUser$ = this.dataUser.asObservable();
  sessionData$ = this.sessionData.asObservable();

  constructor() {
    this.sessionData$.subscribe((val) => {
      this.sessionDataArray = val;
    });
  }

  public setCurrentUser(value) {
    // ("save data function called " + value + this.user.name);
    this.user = value;
    this.dataUser.next(this.user);
  }

  public newSession() {
    this.sessionData.next([]);
  }

  public addOrderToSessionData(val) {
    this.sessionDataArray.push(val);
    this.sessionData.next(this.sessionDataArray);
  }
}
