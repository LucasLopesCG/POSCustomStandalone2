import { Component, OnInit, EventEmitter } from "@angular/core";
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
  allStores: any = {};
  token: any = null;
  currentUser: any = {};
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
    });
    storeService.availableStoreLocation$.subscribe((val) => {
      this.availableLocations = val;
    });
    wordpressService.wordpressUserList$.subscribe((val) => {
      this.isLoading = true;
      this.determineAvailableLocations(val);
      this.isLoading = false;
    });
    wordpressService.wordpressStoreList$.subscribe((val) => {
      if (this.selectedLocation != null) {
        console.log(val);
        console.log(
          "find the discounts for selected store and call store service to set discounts for the store",
        );
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
  }
  ngOnInit(): void {
    //this.auth();
    this.getAllUsers();
  }

  determineAvailableLocations(val: any) {
    val.forEach((element) => {
      if (element.email == this.currentUser.email) {
        //console.log("FOUND MATCH!");

        var updateUser: User = {
          id: element.id,
          name: this.currentUser.name,
          email: element.email,
          accessLevel: this.determineAccessLevel(element.access_level),
          locationAccess: this.determineLocations(element.stores),
        };

        this.userService.setCurrentUser(updateUser);
      }
    });
  }

  determineAccessLevel(val: string) {
    if (val.toLowerCase() == "admin") {
      return 0;
    }
    if (val.toLowerCase() == "manager") {
      return 2;
    }
    if (val.toLowerCase() == "cashier") {
      return 3;
    }
    return -1;
  }

  determineLocations(stores: string) {
    if (stores == "ALL") {
      return [
        { location: storeLocationEnum.Apopka, isRestaurant: false },
        { location: storeLocationEnum.DeLand, isRestaurant: true },
        { location: storeLocationEnum.Orlando, isRestaurant: true },
        { location: storeLocationEnum.Sanford, isRestaurant: false },
      ];
    } else {
      var output: Array<any> = [];
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
      return output;
    }
  }

  getAllUsers() {
    this.wordpressService.getAllUsers();
  }

  selectLocation(location: storeLocationEnum) {
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
  }

  Logout() {
    this.userService.setCurrentUser({});
    this.socialAuthService.signOut();
  }
}
