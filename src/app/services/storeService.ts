import { Injectable } from "@angular/core";
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscribable,
  Subscription,
  filter,
  of,
  scan,
} from "rxjs";
import { User } from "../models/user";

import { HttpClient } from "@angular/common/http";
import { storeLocationEnum } from "../models/storeLocation";
import { discount } from "../models/discounts";
import { hhTypeEnum } from "../models/hhTypeEnum";
import { happyHour } from "../models/happyHour";
import { coupon } from "../models/coupon";
import { couponTypeEnum } from "../models/couponTypeEnum";
import { product } from "../models/product";
import { order } from "../models/order";
import { orderStatusEnum } from "../models/orderStatusEnum";
import { couponDetail } from "../models/couponDetail";
import { hhItem } from "../models/hhItem";
import { hhDetail } from "../models/hhDetail";
import { hhCategory } from "../models/hhCategory";
import { categoryEnum } from "../models/categoryEnum";
import { restaurantLayout } from "../models/restaurantLayout";
import { accessLevel } from "../models/accessLevel";
import { WordPressService } from "./wordpress.service";
import { OdooService } from "./odoo.service";
@Injectable({
  providedIn: "root",
})
export class storeService {
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

  selectedStoreLocation: any = { storeLocation: "" };
  availableLocations = [];
  productList: Array<product> = [];
  pristineProductList: Array<product> = [];
  couponList: Array<coupon> = [];
  discountForCurrentStoreArray: discount = {};
  pastOrderArray: Array<order> = [];
  usersForCurrentStore: Array<User> = [];
  allStores: any = {};
  // Observable string source
  private dataSelectedStoreLocation = new BehaviorSubject<any>(
    storeLocationEnum.none,
  );
  private availableStoreLocation = new BehaviorSubject<Array<any>>([]);
  private discountsForCurrentStore = new BehaviorSubject<any>({});
  private pristineDiscountsForCurrentStore = new BehaviorSubject<any>({});
  private productsForCurrentStore = new BehaviorSubject<any>({});
  private pristineProductsForCurrentStore = new BehaviorSubject<any>({});
  private couponsForCurrentStore = new BehaviorSubject<any>({});
  private priceListForCurrentStore = new BehaviorSubject<any>({});
  private pastOrdersFromStore = new BehaviorSubject<any>({});
  private happyHourFlag = new BehaviorSubject<boolean>(false);
  private categoryIcons = new BehaviorSubject<Array<string>>([]);
  private taxRateForStore = new BehaviorSubject<any>({});
  private usersForStore = new BehaviorSubject<any>([]);
  private storeId = new BehaviorSubject<number>(-1);
  private enableOdooCalls = new BehaviorSubject<boolean>(false);
  /////////////////////////////////////////////////////////////////////////////////////
  private currentStoreLayout = new BehaviorSubject<any>({});
  private restaurantViewEditMode = new BehaviorSubject<any>({});
  private allLayouts = new BehaviorSubject<any>({});

  // Observable string stream
  dataSelectedStoreLocation$ = this.dataSelectedStoreLocation.asObservable();
  availableStoreLocation$ = this.availableStoreLocation.asObservable();
  discountsForCurrentStore$ = this.discountsForCurrentStore.asObservable();
  pristineDiscountsForCurrentStore$ =
    this.pristineDiscountsForCurrentStore.asObservable();
  productsForCurrentStore$ = this.productsForCurrentStore.asObservable();
  pristineProductsForCurrentStore$ =
    this.pristineProductsForCurrentStore.asObservable();
  couponsForCurrentStore$ = this.couponsForCurrentStore.asObservable();
  priceListForCurrentStore$ = this.priceListForCurrentStore.asObservable();
  pastOrdersFromStore$ = this.pastOrdersFromStore.asObservable();
  happyHourFlag$ = this.happyHourFlag.asObservable();
  categoryIcons$ = this.categoryIcons.asObservable();
  taxRateForStore$ = this.taxRateForStore.asObservable();
  usersForStore$ = this.usersForStore.asObservable();
  storeId$ = this.storeId.asObservable();
  enableOdooCalls$ = this.enableOdooCalls.asObservable();
  /////////////////////////////////////////////////////////////////////////////////////
  currentStoreLayout$ = this.currentStoreLayout.asObservable();
  restaurantViewEditMode$ = this.restaurantViewEditMode.asObservable();
  allLayouts$ = this.allLayouts.asObservable();

  constructor() {
    this.dataSelectedStoreLocation$.subscribe((val) => {
      this.selectedStoreLocation = val;
    });
    this.productsForCurrentStore$.subscribe((val) => {
      this.productList = val;
      this.pristineProductList = structuredClone(val);
    });

    this.couponsForCurrentStore$.subscribe((val) => {
      this.couponList = val;
    });
    this.discountsForCurrentStore$.subscribe((val) => {
      this.discountForCurrentStoreArray = val;
    });
    this.pastOrdersFromStore$.subscribe((val) => {
      this.pastOrderArray = val;
    });
    this.allLayouts$.subscribe((val) => {
      this.allStores = val;
      this.getCurrentStoreLayout();
    });
  }

  public getCategoryIconList() {
    return ["", "", "", ""];
  }

  public setCurrentStore(value) {
    // ("location chosen! " + value);
    this.selectedStoreLocation = value;
    this.dataSelectedStoreLocation.next(this.selectedStoreLocation);
  }

  public setAvailableStore(value) {
    // ("location chosen! " + value);
    this.availableLocations = value;
    this.availableStoreLocation.next(this.availableLocations);
    // ("Available locations:");
    // (this.availableLocations);
  }

  public getPriceListForStore(value) {
    //This function should return the pricelist for the store, tax rate, etc
    this.taxRateForStore.next(0.07);
  }

  public setProductsForStore(val) {
    this.productsForCurrentStore.next(val);
    this.pristineProductsForCurrentStore.next(val);
  }

  public decreaseStockOfProduct(value) {
    this.productList.forEach((product) => {
      if (product.id == value.id && product.stock && product.stock >= 0) {
        product.stock = value.stock - 1;
      }
    });
    this.productsForCurrentStore.next(this.productList);
  }
  public increaseStockOfProduct(value) {
    this.productList.forEach((product) => {
      if (product.id == value.id) {
        var x = product.stock as number;
        x++;
        product.stock = x;
      }
    });
    this.productsForCurrentStore.next(this.productList);
  }

  public getUsersForCurrentStore() {
    //this would trigger an api call to our WP database to find the users for current store
    //for now, just return a static array
    var array: Array<User> = [];
    var user1: User = {};
    user1.accessLevel = accessLevel.Cashier;
    user1.email = "cashier@chronicGuru.com";
    user1.id = "cashier1";
    user1.locationAccess = [
      { location: storeLocationEnum.Apopka, isRestaurant: false },
      { location: storeLocationEnum.DeLand, isRestaurant: true },
    ];
    user1.name = "Cashier Doe";
    user1.phoneNumber = 5558675309;
    var user2: User = {
      accessLevel: accessLevel.Manager,
      email: "Manager@chronicGuru.com",
      id: "manager1",
      locationAccess: [
        { location: storeLocationEnum.Apopka, isRestaurant: false },
        { location: storeLocationEnum.DeLand, isRestaurant: true },
      ],
      name: "Manager Jane",
      phoneNumber: 5559999999,
    };
    array = [user1, user2];
    this.usersForStore.next(array);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////Discount (happy hour and coupon logic) functions here //////////////////////////////////////
  public setDiscountsForStore(val) {
    this.discountsForCurrentStore.next(val);
    this.pristineDiscountsForCurrentStore.next(val);
  }

  reEnableOdoo() {
    this.enableOdooCalls.next(true);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////coupon functions here //////////////////////////////////////

  public deleteCouponForStore(val) {
    var output: Array<coupon> = [];
    if (
      this.discountForCurrentStoreArray &&
      this.discountForCurrentStoreArray.coupon
    ) {
      this.discountForCurrentStoreArray.coupon.forEach((coupon) => {
        if (coupon.couponDetail == val.couponDetail) {
        } else {
          output.push(coupon);
        }
      });
    }
    this.discountForCurrentStoreArray.coupon = output;
    this.discountsForCurrentStore.next(this.discountForCurrentStoreArray);
  }

  public addCouponForStore() {
    if (
      this.discountForCurrentStoreArray &&
      !this.discountForCurrentStoreArray.coupon
    ) {
      this.discountForCurrentStoreArray.coupon = [];
    }
    if (
      this.discountForCurrentStoreArray &&
      this.discountForCurrentStoreArray.coupon
    ) {
      var newCoupon: coupon = {
        couponType: couponTypeEnum.amountOffOrder,
        couponDetail: {
          description: "NEW DESCRIPTION HERE",
          activationCode: "",
        },
      };
      this.discountForCurrentStoreArray.coupon.push(newCoupon);
      this.discountsForCurrentStore.next(this.discountForCurrentStoreArray);
    }
  }

  public setPastOrdersForStore(val) {
    this.pastOrdersFromStore.next(val);
  }

  //This should be an API fetch to get data, but for now, return mock data:
  // var product1: product = {
  //   id: 99,
  //   name: "Past order item With Happy Hour Discount",
  //   price: 3.5,
  //   category: [categoryEnum.Strains],
  //   happyHourDiscount: true,
  // };
  // var product2: product = {
  //   id: 999,
  //   name: "Something To Be refunded",
  //   price: 12.5,
  //   category: [categoryEnum.Strains],
  // };
  // var order: order = {
  //   products: [
  //     { product: product1, count: 1 },
  //     { product: product2, count: 4 },
  //   ],
  //   coupon: [],
  //   orderNumber: 5558675309,
  //   receiptNumber: "5558675309",
  //   cashier: "A Cashier",
  //   status: orderStatusEnum.Paid,
  //   date: new Date(),
  //   total: 43.87,
  //   customer: { name: "Jonnhy Bravo" },
  // };

  public submitOrder(order) {
    if (
      this.pastOrderArray &&
      this.pastOrderArray.length &&
      this.pastOrderArray.length > 0
    ) {
      this.pastOrderArray.push(order);
    } else {
      this.pastOrderArray = [order];
    }
    this.pastOrdersFromStore.next(this.pastOrderArray);
  }

  public addCouponToCouponList(coupon: coupon) {
    var newCouponList: Array<coupon> = [];
    if (this.couponList && this.couponList.length > 0) {
      newCouponList = this.couponList;
    }
    newCouponList.push(coupon);
    this.couponsForCurrentStore.next(newCouponList);
  }

  public setCouponList(coupons: Array<coupon>) {
    this.couponsForCurrentStore.next(coupons);
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////Happy Hour functions//////////////////////////////////////////////////////

  public setHappyHourFlag(val) {
    this.happyHourFlag.next(val);
  }

  public deleteHappyHourForStore(val) {
    //This is where the call would go to delete the happyhour row
    var output: Array<happyHour> = [];
    if (
      this.discountForCurrentStoreArray &&
      this.discountForCurrentStoreArray.happyHour
    ) {
      this.discountForCurrentStoreArray.happyHour.forEach((happyHour) => {
        if (happyHour.id == val.id) {
        } else {
          output.push(happyHour);
        }
      });
    }
    this.discountForCurrentStoreArray.happyHour = output;
    this.discountsForCurrentStore.next(this.discountForCurrentStoreArray);
  }

  public addHappyHourForStore() {
    if (
      this.discountForCurrentStoreArray &&
      !this.discountForCurrentStoreArray.happyHour
    ) {
      this.discountForCurrentStoreArray.happyHour = [];
    }
    if (
      this.discountForCurrentStoreArray &&
      this.discountForCurrentStoreArray.happyHour
    ) {
      var newHH: happyHour = {
        id: this.discountForCurrentStoreArray?.happyHour?.length
          ? this.discountForCurrentStoreArray.happyHour.length + 1
          : 99,
        hhStart: new Date(),
        hhEnd: new Date(),
        hhType: hhTypeEnum.allProducts,
        hhDetail: {
          happyHourItemList: [],
          happyHourCategoryList: [],
          happyHourDiscountAll: 0,
          happyHourBXGO: { products: [], triggerCount: 0 },
          happyHourCombo: [],
        },
      };
      this.discountForCurrentStoreArray.happyHour.push(newHH);
      this.discountsForCurrentStore.next(this.discountForCurrentStoreArray);
    }
  }

  updateProductWithHHPrice(data: {
    id: number;
    discount: number | null;
    newPrice: number | null;
  }) {
    var pristineProductListCopy = structuredClone(this.pristineProductList);
    pristineProductListCopy.forEach((product) => {
      if (product.id == data.id) {
        if (data.discount != null) {
          var mult = (100 - data.discount) / 100;
          product.price = (product.price as number) * mult;
        } else if (data.newPrice != null) {
          product.price = data.newPrice as number;
        }
        product.happyHourDiscount = true;
      }
    });
    //productList values have been updated!
    this.productsForCurrentStore.next(pristineProductListCopy);
  }

  updateCategoryWithHHPrice(data: {
    id: categoryEnum;
    discount: number | null;
    newPrice: number | null;
  }) {
    // (data.id);
    var pristineProductListCopy = structuredClone(this.pristineProductList);
    if (pristineProductListCopy && pristineProductListCopy.length > 0) {
      pristineProductListCopy.forEach((product) => {
        // (product.category);
        var productCat = product.category as Array<categoryEnum>;
        if (productCat.includes(data.id)) {
          if (data.discount != null) {
            var mult = (100 - data.discount) / 100;
            product.price = (product.price as number) * mult;
          } else if (data.newPrice != null) {
            product.price = data.newPrice as number;
          }
          product.happyHourDiscount = true;
        }
      });
      this.productsForCurrentStore.next(pristineProductListCopy);
    }
  }

  updateProductWithBXGOData(data: { product: product; bx: number }) {
    var pristineProductListCopy = structuredClone(this.pristineProductList);
    pristineProductListCopy.forEach((product) => {
      if (product.id == data.product.id) {
        product.happyHourDiscount = true;
        product.bxgo = data.bx;
      }
    });
    //productList values have been updated!
    this.productsForCurrentStore.next(pristineProductListCopy);
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////Restaurant functions//////////////////////////////

  setAllLayouts(layouts) {
    this.allLayouts.next(layouts);
  }

  getCurrentStoreLayout() {
    //This is where the call to retrieve the obj (converted into a json object) would go out. but for now just return a blank layout.
    var locatedStore: any = {};
    var existingLayout: restaurantLayout = {
      tables: [],
      bars: [],
      stools: [],
      dimensions: [0, 0],
    };
    var existingDiscount: discount = {};
    var foundStoreMatch: boolean = false;
    if (this.allStores && this.allStores.length > 0) {
      this.allStores.forEach((store) => {
        if (
          store.name.toLowerCase() ==
          this.selectedStoreLocation.location.toLowerCase()
        ) {
          locatedStore = store;
          foundStoreMatch = true;
        }
      });
      if (foundStoreMatch) {
        this.storeId.next(locatedStore.id);
        existingLayout = JSON.parse(locatedStore.layout);
        existingDiscount = JSON.parse(locatedStore.discounts);
        this.currentStoreLayout.next(existingLayout);
        this.setDiscountsForStore(existingDiscount);
      } else {
        var layout: restaurantLayout = {
          tables: [],
          bars: [],
          stools: [],
          dimensions: [0, 0],
        };
        var discount: discount = {
          happyHour: [],
          coupon: [],
        };
        this.currentStoreLayout.next(layout);
        this.setDiscountsForStore(discount);
      }
    }
  }

  saveCurrentStoreLayout(data) {
    //grab store location name
    //grab discounts from store
    //this.wordPressService.updateStore(storeData);
    //This is where the call to save the obj as a json converted object to the database's appropriate location would be made. For now, it just updates the observable (as it should anyways)
    this.currentStoreLayout.next(data);
  }

  setCurrentRestaurantMode(val) {
    this.restaurantViewEditMode.next(val);
  }
}
