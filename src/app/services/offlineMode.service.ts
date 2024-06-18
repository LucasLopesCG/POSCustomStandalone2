import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { order } from "../models/order";
@Injectable({
  providedIn: "root",
})
export class offlineModeService {
  orderListArray: Array<order> = [];
  private orderList = new BehaviorSubject<any>({});

  orderList$ = this.orderList.asObservable();
  addNewOrder(order: order) {
    this.orderListArray.push(order);
    this.orderList.next(this.orderListArray);
  }

  removeOrderFromList(order: order) {
    var updatedOrderList: Array<order> = [];
    this.orderListArray.forEach((offlineOrder) => {
      if (offlineOrder.orderNumber != order.orderNumber) {
        updatedOrderList.push(offlineOrder);
      }
    });
    this.orderListArray = updatedOrderList;
    this.orderList.next(this.orderListArray);
  }
}
