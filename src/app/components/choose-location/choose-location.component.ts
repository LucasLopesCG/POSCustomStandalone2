import { Component, OnInit, EventEmitter, inject } from "@angular/core";
import { storeService } from "../../services/storeService";
import { storeLocationEnum } from "../../models/storeLocation";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { PointOfSaleComponent } from "../point-of-sale/point-of-sale.component";
import { RestaurantLayoutViewComponent } from "./../restaurant-layout-view/restaurant-layout-view.component";
import { CurrentOrderService } from "../../services/current-order.service";
import { MatIcon } from "@angular/material/icon";
import { userService } from "../../services/userService";
import {
  GoogleLoginProvider,
  SocialAuthService,
  SocialAuthServiceConfig,
} from "@abacritt/angularx-social-login";
import {
  HttpClientModule,
  HttpClient,
  HttpHeaders,
} from "@angular/common/http";
import { WordPressService } from "../../services/wordpress.service";
import { User } from "../../models/user";
import { OdooService } from "../../services/odoo.service";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { accessLevel } from "../../models/accessLevel";
import { MatDialog } from "@angular/material/dialog";
import { RefundModalComponent } from "../point-of-sale/sub-components/refund-modal/refund-modal.component";
import { CreateSessionModalComponent } from "../create-session-modal/create-session-modal.component";

@Component({
  selector: "app-choose-location",
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    PointOfSaleComponent,
    RestaurantLayoutViewComponent,
    MatIcon,
    MatProgressSpinnerModule,
    HttpClientModule, // <---
  ],
  providers: [
    {
      provide: "SocialAuthServiceConfig",
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              "857908989278-pi76j5ssnbllatmj931pd693dkmqijou.apps.googleusercontent.com",
            ),
          },
        ],
      } as SocialAuthServiceConfig,
    },
    SocialAuthService,
  ],
  templateUrl: "./choose-location.component.html",
  styleUrl: "./choose-location.component.css",
})
export class ChooseLocationComponent implements OnInit {
  private dialog = inject(MatDialog);
  allStores: any = {};
  token: any = null;
  currentUser: any = {};
  configIds: Array<any> = [];
  private apiUrl =
    "https://woocommerce-1248616-4474056.cloudwaysapps.com/wp-json"; // Replace with your WordPress site URL
  username: string = "chronictest";
  password: string = "GuruGuru24";
  credentials = btoa(`${this.username}:${this.password}`);
  tokenChange = new EventEmitter<string>();
  allUsersFromWP: any = {};
  selectedLocation: any = null;
  availableLocations: any = [];
  wordpressResponse: any = {};
  wordpressUserList: any = {};
  POSSessionStates: Array<any> = [];
  isLoading: boolean = true;
  users: any = {};
  constructor(
    private storeService: storeService,
    private currentOrderService: CurrentOrderService,
    private userService: userService,
    private socialAuthService: SocialAuthService,
    private http: HttpClient,
    private wordpressService: WordPressService,
    private odooService: OdooService,
  ) {
    userService.dataUser$.subscribe((val) => {
      this.currentUser = val;
      this.currentUser.name = this.currentUser.name.replace(/\s/g, "");
      console.log(val);
    });
    storeService.availableStoreLocation$.subscribe((val) => {
      this.availableLocations = val;
    });
    wordpressService.wordpressUserList$.subscribe((val) => {
      this.isLoading = true;
      this.wordpressUserList = val;
      this.odooService.getPOSConfigIds();
    });
    odooService.configIds$.subscribe((val) => {
      if (val && val.length > 0) {
        this.configIds = val;
        this.configIds.forEach((configId) => {
          this.odooService.getPOSStatusById(configId.id);
        });
      }
    });
    wordpressService.wordpressStoreList$.subscribe((val) => {
      if (this.selectedLocation != null) {
        val.forEach((store) => {
          if (store.name == this.selectedLocation.location) {
            var discounts = JSON.parse(store.discounts);
            this.storeService.setDiscountsForStore(discounts);
          }
        });
      }
      this.allStores = val;
      this.storeService.setAllLayouts(val);
    });
    storeService.dataSelectedStoreLocation$.subscribe((val) => {
      this.selectedLocation = val;
      //Run logic here to gather information of the locations the user has access to:
      if (this.selectedLocation.isRestaurant) {
        //Need custom logic here to reset the bxgoProducts array to be based on each cart
      } else {
        this.currentOrderService.emptyBXGOProductArray();
      }
    });
    odooService.POSSessionStates$.subscribe((val) => {
      if (val && val.length > 0) {
        this.POSSessionStates = val;
        if (this.POSSessionStates.length == this.configIds.length) {
          this.determineAvailableLocations(this.wordpressUserList);
          this.isLoading = false;
        }
      }
    });
  }
  ngOnInit(): void {
    //this.auth();
    this.getAllUsers();
  }

  determineAvailableLocations(val: any) {
    if (val && val.length > 0) {
      val.forEach((element) => {
        if (element.email == this.currentUser.email) {
          var updateUser: User = {
            id: element.id,
            name: this.currentUser.name,
            email: element.email,
            accessLevel: this.determineAccessLevel(element.access_level),
            locationAccess: this.determineLocations(element.stores),
          };
          console.log(updateUser);
          this.userService.setCurrentUser(updateUser);
        }
      });
    }
  }

  determineAccessLevel(val: string) {
    if (val.toLowerCase() == "admin") {
      return accessLevel.Admin;
    }
    if (val.toLowerCase() == "manager") {
      return accessLevel.Manager;
    }
    if (val.toLowerCase() == "cashier") {
      return accessLevel.Cashier;
    }
    return accessLevel.none;
  }

  determineLocations(stores: string) {
    var output: Array<any> = [];
    if (stores == "ALL") {
      output = [
        { location: storeLocationEnum.Apopka, isRestaurant: false },
        { location: storeLocationEnum.DeLand, isRestaurant: true },
        { location: storeLocationEnum.Orlando, isRestaurant: true },
        { location: storeLocationEnum.Sanford, isRestaurant: false },
      ];
    } else {
      var locations = stores.split(",");
      locations.forEach((loc) => {
        if (loc.toLowerCase() == "apopka") {
          output.push({
            location: storeLocationEnum.Apopka,
            isRestaurant: false,
          });
        }
        if (loc.toLowerCase() == "deland") {
          output.push({
            location: storeLocationEnum.DeLand,
            isRestaurant: true,
          });
        }
        if (loc.toLowerCase() == "orlando") {
          output.push({
            location: storeLocationEnum.Orlando,
            isRestaurant: true,
          });
        }
        if (loc.toLowerCase() == "sanford") {
          output.push({
            location: storeLocationEnum.Sanford,
            isRestaurant: false,
          });
        }
      });
    }
    //Now, use the data that I pull from getPOSConfigIds to expand the list to include
    //all locations
    var output2: Array<any> = [];
    output.forEach((location) => {
      this.configIds.forEach((configId) => {
        if (
          configId.name.toLowerCase().includes(location.location.toLowerCase())
        ) {
          location.name = configId.name;
          location.configId = configId.id;
          output2.push(structuredClone(location));
        }
      });
    });

    this.POSSessionStates.forEach((state) => {
      output2.forEach((outputItem) => {
        if (outputItem.configId == state.id) {
          outputItem.cashInRegister = state.cashInRegister;
          outputItem.inUse = state.inUse;
          outputItem.cashier = state.cashier;
          outputItem.sessionId = state.sessionId;
          outputItem.order_ids = state.order_ids;
        }
      });
    });
    return output2;
  }

  getAllUsers() {
    this.wordpressService.getAllUsers();
  }

  resumeSession(location) {
    this.odooService.setSessionId(location.sessionId);
    this.selectLocation(location);
    this.userService.addToRegister(location.cashInRegister);
    //Now I need to query the session that I just resumed.
    // I need to find out how much money was exchanged by the orders of this session.
    //the "order_ids" array contains an array of orders associated with this session.
    location.order_ids.forEach((order) => {
      this.odooService
        .checkOrderAmountsById(order)
        .subscribe((orderDetails) => {
          this.userService.addToRegister(orderDetails[0].amount_total);
        });
    });
    //I can then start a loop of calls to checkOrderAmountsById to add up what the expected total is
  }

  /**
   * Called before selectLocation is called. This calls the "create session Modal", which asks user to fill certain information.
   */
  createNewSession(location) {
    //When a location is selected, open the modal for user to start a session.
    //When session is created, trigger the "selectLocation" code
    var createSessionModal = this.dialog.open(CreateSessionModalComponent, {
      data: location,
    });
    createSessionModal.afterClosed().subscribe((result) => {
      if (result == "cancel") {
        //do nothing
      } else if (this.isStringNumber(result)) {
        var amt = parseFloat(result);
        this.odooService.createSession(
          location.configId,
          6,
          amt,
          this.currentUser.name,
        );
        this.selectLocation(location);
        this.userService.addToRegister(amt);
      }
    });
  }

  isStringNumber(str: string): boolean {
    const num = parseFloat(str);
    return !isNaN(num);
  }

  selectLocation(location) {
    // ("STORE SELECTED");
    // (location);
    this.storeService.setCurrentStore(location);
    this.wordpressService.getAllStores();
    //Need to run logic on the subscription of this to check against current location and set the proper values to memory based off results from this
    this.storeService.getPriceListForStore(location);
    this.storeService.setCurrentRestaurantMode("view");
    //call wordpress service to get stores, locate the one we have selected and then use storeService to set discount for the stores based on what's pulled
    this.wordpressService.getAllStores();
    //this.storeService.getDiscountsForStore(location);

    //TO DO-REMOVE THIS!!! IT SHOULD INSTEAD USE THE ODOO SERVICE!!
    //this.storeService.getProductsForStore(location);
    this.currentOrderService.goToOrderStatus();
    this.currentOrderService.newOrder();
    //this.storeService.getPastOrdersFromStore();
    this.odooService.getPastOrdersForCustomers();
    this.odooService.getCustomers();
    var stockFilter: string = "";
    var location2: any = location;
    switch (location2.location) {
      case "Apopka":
        stockFilter = "APS/Stock";
        break;
      case "DeLand":
        stockFilter = "DL/Stock";
        break;
      case "Orlando":
        stockFilter = "ORL/Stock";
        break;
      case "Sanford":
        stockFilter = "SANFO/Stock";
        break;
    }
    this.odooService.wipeProductData();
    this.odooService.getCombinedProductData(stockFilter);
    this.odooService.orderComplete({});
  }

  Logout() {
    this.userService.setCurrentUser({});
    this.socialAuthService.signOut();
  }
}
