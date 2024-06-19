import { Component, ElementRef, ViewChild, inject } from "@angular/core";
import { User } from "../../models/user";
import { userService } from "../../services/userService";
import { storeService } from "../../services/storeService";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { discount } from "../../models/discounts";
import { Observable } from "rxjs";
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";

import { ProductListComponent } from "./sub-components/product-list/product-list.component";
import { CurrentOrderComponent } from "./sub-components/current-order/current-order.component";
import { StoreDiscountSettingsComponent } from "./sub-components/store-discount-settings/store-discount-settings.component";
import { CloseSessionModalComponent } from "../close-session-modal/close-session-modal.component";
import { CashierSettingsModalComponent } from "../cashier-settings-modal/cashier-settings-modal.component";
import { orderStatusEnum } from "../../models/orderStatusEnum";
import { CurrentOrderService } from "../../services/current-order.service";
import { PaymentComponent } from "../payment/payment.component";
import { OrderCompleteComponent } from "../order-complete/order-complete.component";
import { order } from "../../models/order";
import { OdooService } from "../../services/odoo.service";

@Component({
  selector: "app-point-of-sale",
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ProductListComponent,
    CurrentOrderComponent,
    StoreDiscountSettingsComponent,
    CashierSettingsModalComponent,
    PaymentComponent,
    OrderCompleteComponent,
  ],
  providers: [{ provide: MatDialogRef, useValue: {} }],
  templateUrl: "./point-of-sale.component.html",
  styleUrl: "./point-of-sale.component.css",
})
export class PointOfSaleComponent {
  @ViewChild("fileInput") fileInput: any;
  fileContents: string = "";
  public orderStatusEnum = orderStatusEnum;
  private dialog = inject(MatDialog);
  selectedLocation: any = null;
  discountsForCurrentLocation: discount = {};
  user: User = {};
  sessionData: Array<order> = [];
  orderStatus: orderStatusEnum = orderStatusEnum.Ordering;
  happyHourFlag: boolean = false;
  _showDiscountModal: boolean = false;
  observableDiscountPipe$: Observable<discount>;
  constructor(
    private userService: userService,
    storeService: storeService,
    private currentOrderService: CurrentOrderService,
    private elementRef: ElementRef,
    private odooService: OdooService,
  ) {
    userService.sessionData$.subscribe((val) => {
      this.sessionData = val;
    });
    // userService.userSubject.asObservable().subscribe((content)=>{
    //   this.user=content
    //    ("value of user updated?")
    //    (this.user);
    // })
    userService.dataUser$.subscribe((val) => {
      this.user = val;
      // ("USER VALUE UPDATED!!");
      // (this.user);
    });
    storeService.happyHourFlag$.subscribe((val) => {
      this.happyHourFlag = val;
    });
    this.observableDiscountPipe$ = storeService.discountsForCurrentStore$;
    storeService.discountsForCurrentStore$.subscribe((val) => {
      this.discountsForCurrentLocation = val;
      // (this.discountsForCurrentLocation);
    });
    currentOrderService.orderStatus$.subscribe((val) => {
      this.orderStatus = val;
    });
    storeService.dataSelectedStoreLocation$.subscribe((val) => {
      this.selectedLocation = val;
      //storeService.getDiscountsForStore(val);
      // ("DATA SAVED: Selected location is:");
      // (this.selectedLocation);
      //Run logic here to gather information of the locations the user has access to:
    });
  }

  public get getDiscountsForCurrentLocation(): discount {
    return this.discountsForCurrentLocation;
  }

  openStoreDiscountSettings(): void {
    this.dialog.open(StoreDiscountSettingsComponent, {
      data: "NO DATA PRESENT",
    });
  }

  openStoreCashierSettings(): void {
    //TODO: create StoreCashierSettingsComponent
    this.dialog.open(CashierSettingsModalComponent);
  }

  openGenerateStoreReport(): void {
    //this.dialog.open(GenerateStoreReportModalComponent);
    let res = JSON.stringify(this.sessionData);
    const blob = new Blob([res], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  }

  openCloseSessionModal(): void {
    //TODO: create closeSessionModal (and assorted logic!)
    this.dialog.open(CloseSessionModalComponent);
  }

  get showDiscountModal(): boolean {
    return this._showDiscountModal;
  }

  openFileSelector(): void {
    this.fileInput.nativeElement.click();
  }

  handleFileInput(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        console.error("Only CSV files are allowed.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.fileContents = reader.result as string;
        //console.log(this.fileContents);
        var importedOrders = JSON.parse(this.fileContents);
        importedOrders.forEach((order) => {
          this.odooService.sendNewOrder(order, 0, false);
        });
        //console.log(importedOrders);
      };
      reader.readAsText(file);
    }
  }
}
