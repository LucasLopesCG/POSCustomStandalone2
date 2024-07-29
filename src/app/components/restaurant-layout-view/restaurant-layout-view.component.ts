import { Component, ViewChild, inject } from "@angular/core";
import { userService } from "../../services/userService";
import { User } from "../../models/user";
import { MatDialog } from "@angular/material/dialog";
import { RestaurantLayoutEditComponent } from "./restaurant-layout-edit/restaurant-layout-edit.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { storeService } from "../../services/storeService";
import { restaurantLayout } from "../../models/restaurantLayout";
import { CdkDrag } from "@angular/cdk/drag-drop";
import { orderStatusEnum } from "../../models/orderStatusEnum";
import { order } from "../../models/order";
import { CurrentOrderService } from "../../services/current-order.service";
import { storeLocationEnum } from "../../models/storeLocation";
import { CurrentOrderComponent } from "../point-of-sale/sub-components/current-order/current-order.component";
import { ProductListComponent } from "../point-of-sale/sub-components/product-list/product-list.component";
import { StoreDiscountSettingsComponent } from "../point-of-sale/sub-components/store-discount-settings/store-discount-settings.component";
import { product } from "../../models/product";
import { CloseSessionModalComponent } from "../close-session-modal/close-session-modal.component";
import { CashierSettingsModalComponent } from "../cashier-settings-modal/cashier-settings-modal.component";
import { customerService } from "../../services/customerService";
import { customer } from "../../models/customer";
import { PaymentComponent } from "../payment/payment.component";
import { OrderCompleteComponent } from "../order-complete/order-complete.component";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { OdooService } from "../../services/odoo.service";
import { accessLevel } from "../../models/accessLevel";
import { GoogleLogInComponent } from "../google-login/google-login.component";
import { CashierSwitchOrLockModalComponent } from "../cashier-switch-or-lock-modal/cashier-switch-or-lock-modal.component";
import { MatMenuModule } from "@angular/material/menu";
@Component({
  selector: "app-restaurant-layout-view",
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    CdkDrag,
    RestaurantLayoutEditComponent,
    ProductListComponent,
    CurrentOrderComponent,
    StoreDiscountSettingsComponent,
    CashierSettingsModalComponent,
    PaymentComponent,
    OrderCompleteComponent,
    MatProgressSpinnerModule,
    MatMenuModule,
  ],
  templateUrl: "./restaurant-layout-view.component.html",
  styleUrl: "./restaurant-layout-view.component.css",
})
export class RestaurantLayoutViewComponent {
  public accessLevel = accessLevel;
  @ViewChild("fileInput") fileInput: any;
  fileContents: string = "";
  sessionData: Array<order> = [];
  public orderStatusEnum = orderStatusEnum;
  orderStatus: orderStatusEnum = orderStatusEnum.Ordering;
  availableTaxRates: Array<any> = [];
  restaurantServiceLocation: string = "Table 1";
  private dialog = inject(MatDialog);
  mode: string = "view";
  layout: restaurantLayout = {
    tables: [],
    bars: [],
    stools: [],
    dimensions: [0, 0],
  };
  user: User = {};
  storeLocation: storeLocationEnum = storeLocationEnum.none;
  happyHourFlag: boolean = false;
  updateFor: string = "";
  updateIndex: number = 0;
  currentEditOrder: any = {};
  currentEditOrderGrouped: any = {};
  selectedCustomer: customer = {};
  isLoading: boolean = true;
  constructor(
    private userService: userService,
    private storeService: storeService,
    private currentOrderService: CurrentOrderService,
    private customerService: customerService,
    private odooService: OdooService,
  ) {
    userService.sessionData$.subscribe((val) => {
      this.sessionData = val;
    });
    customerService.selectedCustomer$.subscribe((val) => {
      this.selectedCustomer = val;
      // (this.availableCustomers);
    });
    this.odooService.taxRates$.subscribe((val) => {
      this.availableTaxRates = val;
    });
    this.storeService.currentStoreLayout$.subscribe((val) => {
      this.isLoading = true;
      this.layout = val;
      this.isLoading = false;
    });
    userService.dataUser$.subscribe((val) => {
      this.user = val;
      // ("USER VALUE UPDATED!!");
      // (this.user);
    });
    currentOrderService.orderStatus$.subscribe((val) => {
      this.orderStatus = val;
    });
    this.storeService.restaurantViewEditMode$.subscribe((val) => {
      this.mode = val;
    });
    this.storeService.dataSelectedStoreLocation$.subscribe((val) => {
      this.storeLocation = val;
    });
    storeService.happyHourFlag$.subscribe((val) => {
      this.happyHourFlag = val;
    });
    currentOrderService.currentOrder$.subscribe((val) => {
      this.currentEditOrder = val;
    });
  }
  openRestaurantLayoutChangeModal() {
    // this.dialog.open(RestaurantLayoutEditComponent, {
    //   data: "NO DATA PRESENT",
    // });
    this.storeService.setCurrentRestaurantMode("edit");
  }
  openStoreDiscountSettings(): void {
    this.dialog.open(StoreDiscountSettingsComponent, {
      data: "NO DATA PRESENT",
    });
  }
  openStoreCashierSettings() {
    this.dialog.open(CashierSettingsModalComponent);
  }
  openCloseSessionModal() {
    this.dialog.open(CloseSessionModalComponent);
  }

  determineCurrentOrderGrouped() {
    var currentProduct = "";
    var currentProductCountArray: Array<{ product: product; count: number }> =
      [];
    var count = 0;
    var finalProduct: product = {};
    if (
      this.currentEditOrder &&
      this.currentEditOrder.products &&
      this.currentEditOrder.products.length > 0
    ) {
      this.currentEditOrder.products.forEach((product) => {
        var groupFound = false;
        currentProductCountArray.forEach((productGroup) => {
          if (productGroup.product.name == product.name) {
            //Found the product inside the order, increment the value of productGroup
            productGroup.count++;
            groupFound = true;
          }
        });
        if (!groupFound) {
          currentProductCountArray.push({ product: product, count: 1 });
        }
      });
      // ("GROUPED PRODUCT ORDER: ");
      // (currentProductCountArray);
      this.currentEditOrderGrouped = currentProductCountArray;
    }
  }

  determineGroupedOrderAsList(
    groupOrder: Array<{ product: product; count: number }>,
  ): Array<product> {
    var output: Array<product> = [];
    groupOrder.forEach((productArray) => {
      var count: number = 0;
      while (count < productArray.count) {
        output.push(productArray.product);
        count++;
      }
    });

    return output;
  }

  returnToLayoutView() {
    var newLayout: restaurantLayout = structuredClone(this.layout);
    //this.determineCurrentOrderGrouped();

    if (
      this.updateFor == "stool" &&
      newLayout.stools[this.updateIndex].order.products
    ) {
      newLayout.stools[this.updateIndex].order.products =
        this.currentEditOrder.products;
      newLayout.stools[this.updateIndex].order.customer = this.selectedCustomer;
      newLayout.stools[this.updateIndex].order.coupon =
        this.currentEditOrder.coupon;
    }
    if (this.updateFor == "table") {
      newLayout.tables[this.updateIndex].order.products =
        this.currentEditOrder.products;
      newLayout.tables[this.updateIndex].order.customer = this.selectedCustomer;
      newLayout.tables[this.updateIndex].order.coupon =
        this.currentEditOrder.coupon;
    }

    this.storeService.saveCurrentStoreLayout(newLayout);
    this.storeService.setCurrentRestaurantMode("view");
  }

  showOrderForStool(i) {
    this.currentOrderService.selectCoupon({});
    //call store service to fetch the order associated with this locations's layout appropriate order (creating one if necessary)
    this.storeService.setCurrentRestaurantMode("order");
    this.updateFor = "stool";
    this.updateIndex = i;
    this.restaurantServiceLocation =
      this.updateFor + " " + (this.updateIndex + 1);
    var newOrder: order = {
      products: [],
      coupon: [],
      bxgoProducts: [],
      orderNumber: 0,
      receiptNumber: "idk?",
      cashier: this.user.name,
      total: 0,
      customer: {},
      status: orderStatusEnum.Ordering,
      taxRate: this.determineTaxRate(this.storeLocation),
      date: new Date(),
    };
    if (!this.layout.stools[i].order.products) {
      this.layout.stools[i].order = newOrder;
      this.currentOrderService.newOrder();
      this.customerService.setCurrentCustomer({});
      this.currentOrderService.emptyBXGOProductArray();
    } else {
      if (
        this.layout &&
        this.layout.stools &&
        this.layout.stools[i] &&
        this.layout.stools[i].order.products
      ) {
        if (
          this.layout.stools[i].order.products &&
          this.layout.stools[i].order.products?.length
        ) {
          var productGroup = this.layout.stools[i].order.products as Array<{
            product: product;
            count: number;
          }>;

          var oldOrderList = this.determineGroupedOrderAsList(productGroup);
          this.currentOrderService.resumeOrder(oldOrderList);
          var oldCustomer = this.layout.stools[i].order.customer as customer;
          this.customerService.setCurrentCustomer(oldCustomer);
          var oldBXGOList = this.layout.stools[i].order
            .bxgoProducts as Array<product>;
          this.currentOrderService.setBXGOProductArray(oldBXGOList);
          if (this.layout.stools[i].order.coupon) {
            var coupon = this.layout.stools[i].order.coupon;
            if (coupon && coupon.length == 1) {
              this.currentOrderService.selectCoupon(coupon[0]);
            }
          }
        }
      }
    }
    //this.storeService.getProductsForStore(this.storeLocation);
  }

  showOrderForTable(i) {
    this.currentOrderService.selectCoupon({});
    this.storeService.setCurrentRestaurantMode("order");
    this.updateFor = "table";
    this.updateIndex = i;
    this.restaurantServiceLocation =
      this.updateFor + " " + (this.updateIndex + 1);
    var newOrder: order = {
      products: [],
      coupon: [],
      bxgoProducts: [],
      orderNumber: 0,
      receiptNumber: "idk?",
      cashier: this.user.name,
      total: 0,
      customer: {},
      status: orderStatusEnum.Ordering,
      taxRate: this.determineTaxRate(this.storeLocation),
      date: new Date(),
    };
    if (!this.layout.tables[i].order.products) {
      this.layout.tables[i].order = newOrder;
      this.currentOrderService.newOrder();
      this.customerService.setCurrentCustomer({});
      this.currentOrderService.emptyBXGOProductArray();
    } else {
      if (this.layout.tables[i].order.products) {
        var productGroup = this.layout.tables[i].order.products as Array<{
          product: product;
          count: number;
        }>;
        var oldOrderList = this.determineGroupedOrderAsList(productGroup);
        this.currentOrderService.resumeOrder(oldOrderList);
        var oldCustomer = this.layout.tables[i].order.customer as customer;
        this.customerService.setCurrentCustomer(oldCustomer);
        var oldBXGOList = this.layout.tables[i].order
          .bxgoProducts as Array<product>;
        this.currentOrderService.setBXGOProductArray(oldBXGOList);
        if (this.layout.tables[i].order.coupon) {
          var coupon = this.layout.tables[i].order.coupon;
          if (coupon && coupon.length == 1) {
            this.currentOrderService.selectCoupon(coupon[0]);
          }
        }
      }
    }
    //this.storeService.getProductsForStore(this.storeLocation);
  }

  determineTaxRate(location): number {
    var output: number = 0;
    var stringToConvertToPercentage: string = "";
    if (this.availableTaxRates && this.availableTaxRates.length > 0) {
      this.availableTaxRates.forEach((taxRate) => {
        if (taxRate.position_id[1] == location.location) {
          stringToConvertToPercentage = taxRate.tax_dest_id[1];
          stringToConvertToPercentage =
            stringToConvertToPercentage.split("%")[0];
          output = +stringToConvertToPercentage;
          output = output / 100;
        }
      });
    }

    return output;
  }

  openGenerateStoreReport() {
    //this.dialog.open(GenerateStoreReportModalComponent);
    let res = JSON.stringify(this.sessionData);
    const blob = new Blob([res], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    window.open(url);
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
          this.odooService.sendNewOrder(order, false);
        });
        //console.log(importedOrders);
      };
      reader.readAsText(file);
    }
  }
  openSwitchCashier() {
    //basically, make a modal that contains the login button (change this to be a copy of the login component? to handle extra functions)
    this.dialog.open(CashierSwitchOrLockModalComponent, {
      data: false,
    });
  }
  openLockCashier() {
    this.dialog.open(CashierSwitchOrLockModalComponent, {
      data: true,
    });
  }
}
