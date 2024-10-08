import { AfterViewInit, Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { CurrentOrderService } from "../../../../services/current-order.service";
import { VariantSelectComponent } from "../variant-select/variant-select.component";
import { storeService } from "../../../../services/storeService";
import { MatIcon } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { order } from "../../../../models/order";
import { product } from "../../../../models/product";
import { OdooService } from "../../../../services/odoo.service";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
  selector: "app-refund-modal",
  standalone: true,
  imports: [FormsModule, CommonModule, MatIcon, MatProgressSpinnerModule],
  templateUrl: "./refund-modal.component.html",
  styleUrl: "./refund-modal.component.css",
})
export class RefundModalComponent implements AfterViewInit {
  page: number = 0;
  maxPage: number = 1;
  maxPageCount: number = 1;
  filteredOrders: Array<any> = [];
  currentOrder: order = {};
  currentMode: string = "all orders";
  selectedOrder: any = {};
  pristineSelectedOrder: order = {};
  refundItems: Array<product> = [];
  previouslyRefundedItems: Array<any> = [];
  previousOrders: Array<any> = [];
  pristinePreviousOrders: Array<order> = [];
  searchOrders: Array<any> = [];
  pristineSearchOrders: Array<order> = [];
  searchString: string = "";
  searchCustomer: string = "";
  searchOrderRef: string = "";
  searchDate: any = "";
  searchOrderArray: Array<any> = [];
  goBackMode: string = "";
  constructor(
    private currentOrderService: CurrentOrderService,
    private storeService: storeService,
    public dialogRef: MatDialogRef<VariantSelectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private odooService: OdooService,
  ) {
    storeService.pastOrdersFromStore$.subscribe((val) => {
      var val2: Array<any> = [];
      val.forEach((order) => {
        if (order.orderName && order.orderName.includes("POS") && order.note) {
          var cashier = order.note.split(":");
          if (cashier && cashier[2]) order.cashier = cashier[2];
        }
      });
      val.forEach((order) => {
        if (order.state == "draft" || order.state == "cancel") {
          console.log("dont include the drafts");
        } else {
          val2.push(order);
        }
      });
      this.previousOrders = val2;
      this.pristinePreviousOrders = structuredClone(val);
      this.maxPageCount = Math.round(
        this.pristinePreviousOrders.length / 50 - 1,
      );
      this.maxPage = this.maxPageCount;
      this.filterOrders();
      // (this.previousOrders);
    });
    currentOrderService.currentOrder$.subscribe((val) => {
      this.currentOrder = val;
    });
    odooService.pastOrdersSearchResults$.subscribe((val) => {
      if (this.searchDate) {
        val = val.filter((value) => {
          return value.date.includes(this.searchDate.toString());
        });
      }
      this.searchOrders = val;
      this.pristineSearchOrders = structuredClone(val);
      this.maxPageCount = Math.round(this.pristineSearchOrders.length / 50 - 1);
      this.maxPage = this.maxPageCount;
      //this.filterOrders();
    });
  }
  ngAfterViewInit(): void {
    this.currentOrder.refundedProducts = [];
  }

  showOrderDetail(event, mode: string) {
    /*
    //Go into "detail mode".
    //Show the products that are in the order.
    //Have individual buttons next to each item
    that allows user to remove an item from this order and into the "refund list" which should behave exactly like current-order
    */
    this.goBackMode = mode;
    this.currentMode = "refund order";
    this.selectedOrder = structuredClone(event);
    this.pristineSelectedOrder = structuredClone(event);
    this.refundItems = [];
    this.previouslyRefundedItems = [];
    if (
      this.selectedOrder &&
      this.selectedOrder.products &&
      this.selectedOrder.products.length > 0
    ) {
      this.selectedOrder.products.forEach((productGroup) => {
        if (
          productGroup.product.refund_orderline_ids &&
          productGroup.product.refund_orderline_ids.length > 0
        ) {
          this.previouslyRefundedItems.push(productGroup);
        }
      });
    }
  }

  goToSearchMode() {
    this.currentMode = "search";
  }

  returnToViewMode() {
    if (this.goBackMode == "regular") {
      this.currentMode = "all orders";
    } else {
      if (this.currentMode == "search") {
        this.currentMode = "all orders";
      }
      if (this.currentMode == "search results") {
        this.currentMode = "all orders";
      }
      if (this.currentMode == "refund order") {
        this.currentMode = "search results";
      }
    }
    this.selectedOrder = structuredClone(this.pristineSelectedOrder);

    //this.previousOrders = structuredClone(this.pristinePreviousOrders);
  }

  goToRefundMode() {
    /*
    this needs to fire off an event so that it remembers what was selected from the order to be refunded, as well as general details about the order
    This then closes the modal and fires off the necessary events to take user to payment screen. The amount to be paid will be the negative of the items pulled
    //Step 1-Change the currentOrder (overall order, not previous order) to have the selected refund items in it's array of refundedItems.
    //Step 2 - Track the order number that is being refunded.
    //FROM THIS STEP FORWARD, ITS GUESS WORK. NEED TO FIND PROPER DETAILS ON HOW ORDERS ARE REFUNDED WITHIN ODOO.
    //Step 3- when order is paid, update the order being tracked on step 2 to remove the items that were refunded off the order's product list and into the refundedItems
    */
    //1
    this.currentOrder.refundedProducts = this.refundItems;
    //2
    this.refundItems = [];
    this.currentOrder.refundOrderNumber = this.selectedOrder.orderId;
    this.selectedOrder = structuredClone(this.pristineSelectedOrder);
    this.previousOrders = structuredClone(this.pristinePreviousOrders);
    this.currentOrderService.refundSelected(this.currentOrder);
    this.close();
  }

  addItemToRefund(i) {
    //step 1: decrease the count of the item using index, then add it to list!
    if (
      this.selectedOrder &&
      this.selectedOrder.products &&
      this.selectedOrder.products[i].count > 0
    ) {
      this.selectedOrder.products[i].count =
        this.selectedOrder.products[i].count - 1;
      this.refundItems.push(this.selectedOrder.products[i].product);
    }
    //if (event.stock > 0) this.currentOrderService.addItemToOrder(event);
  }

  removeItemFromRefund(event) {
    //Step 1- Remove item from the list of refund items.
    var once: boolean = false;
    var itemRemoved: Array<product> = [];
    this.refundItems.forEach((item) => {
      if (item.id == event.id && !once) {
        once = true;
      } else {
        itemRemoved.push(item);
      }
    });
    this.refundItems = itemRemoved;
    //step 2- find the item group inside of selectedOrder and raise the count

    this.selectedOrder.products?.forEach((productGroup) => {
      if (
        productGroup.product.id == event.id &&
        productGroup.product.price == event.price
      ) {
        productGroup.count++;
      }
    });
  }

  filterOrders(): void {
    if (this.searchString == "") this.filteredOrders = this.previousOrders;
    else {
      this.filteredOrders = this.previousOrders.filter((order) => {
        if (order) {
          const orderCustomer = order.partner_id[1].toLowerCase() as string;
          const orderNumber = order.orderId?.toString().toLowerCase() as string;
          const searchString = this.searchString.toLowerCase();

          if (orderCustomer && orderNumber) {
            return (
              orderCustomer.includes(searchString) ||
              orderNumber.includes(searchString)
            );
          } else if (orderCustomer) {
            return orderCustomer.includes(searchString);
          } else {
            return orderNumber.includes(searchString);
          }
        } else {
          //const searchString = this.searchString.toLowerCase();
          return false;
        }
      });
    }
    this.maxPage = Math.round(this.filteredOrders.length / 50 - 1);
    this.filteredOrders = this.filteredOrders.filter((order) => {
      if (order.refunded_order_ids && order.refunded_order_ids.length == 0)
        return true;
      return false;
    });
  }

  searchPastOrder() {
    this.searchOrderArray = [];
    var searchDateArray = this.searchDate.toString().split("-");
    var date: string = "";
    if (searchDateArray[0]) {
      date = searchDateArray[0];
    }
    var date2: string = "";
    if (searchDateArray[1] && searchDateArray[2]) {
      date2 = searchDateArray[1] + "-" + searchDateArray[2];
    }
    var orderSearchObj = {
      customerName: this.searchCustomer,
      orderRef: this.searchOrderRef,
      date: date,
      date2: date2,
    };
    this.odooService.searchPastOrders(
      orderSearchObj.customerName,
      orderSearchObj.orderRef,
      orderSearchObj.date,
      orderSearchObj.date2,
    );
    this.currentMode = "search results";
  }

  goToPage(i: number) {
    this.page = i;
  }

  beforePage() {
    return this.page * 50;
  }
  afterPage() {
    return this.page * 50 + 50;
  }

  close() {
    this.returnToViewMode();
    this.dialogRef.close();
  }
}
