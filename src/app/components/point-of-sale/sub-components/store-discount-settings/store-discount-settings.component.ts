import { Component, Inject, inject } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { userService } from "./../../../../services/userService";
import { storeService } from "./../../../../services/storeService";
import { hhTypeEnum } from "../../../../models/hhTypeEnum";
import { discount } from "../../../../models/discounts";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { happyHour } from "../../../../models/happyHour";
import { coupon } from "../../../../models/coupon";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { EditHappyHourComponent } from "./edit-happy-hour/edit-happy-hour.component";
import { categoryEnum } from "../../../../models/categoryEnum";
import { hhCategory } from "../../../../models/hhCategory";
import { hhItem } from "../../../../models/hhItem";
import { product } from "../../../../models/product";
import { FilterPipe } from "../../../../pipes/filter";
import { FilterPipe2 } from "../../../../pipes/filter2";
import { couponTypeEnum } from "../../../../models/couponTypeEnum";
import { WordPressService } from "../../../../services/wordpress.service";

@Component({
  selector: "app-store-discount-settings",
  standalone: true,
  imports: [FormsModule, CommonModule, MatIcon, FilterPipe, FilterPipe2],
  providers: [],
  templateUrl: "./store-discount-settings.component.html",
  styleUrl: "./store-discount-settings.component.css",
})
export class StoreDiscountSettingsComponent {
  storeId: number = -1;
  storeLocationName: any = {};
  storeLayout: any = {};
  isProductListVisible = false;
  searchText = "";
  public filter = FilterPipe;
  public simpleFilter = FilterPipe2;
  public hhTypeEnum = hhTypeEnum;
  public couponTypeEnum = couponTypeEnum;
  public categoryEnum = categoryEnum;
  selectedHHDiscountType: Array<string> = [""];
  storeDiscounts: discount = {};
  pristineStoreDiscounts: discount = {};
  mode: string = "displayDiscount";

  selectedCoupon: coupon = {};
  selectedCouponIndex: number = 0;
  selectedUnmodifiedCoupon: coupon = {};
  selectedCouponProductIndex: number = 0;

  selectedHappyHour: happyHour = {};
  selectedHappyHourIndex: number = 0;
  selectedUnmodifiedHappyHour: happyHour = {};

  editHappyHourStartHour: number = 0;
  editHappyHourStartMinute: number = 0;
  editHappyHourEndHour: number = 0;
  editHappyHourEndMinute: number = 0;
  editHappyHourCategory?: hhTypeEnum;
  products: Array<product> = [];

  constructor(
    public dialogRef: MatDialogRef<StoreDiscountSettingsComponent>,
    private userService: userService,
    private storeService: storeService,
    private wordpressService: WordPressService,
  ) {
    storeService.storeId$.subscribe((val) => {
      this.storeId = val;
    });
    storeService.dataSelectedStoreLocation$.subscribe((val) => {
      this.storeLocationName = val;
    });
    storeService.discountsForCurrentStore$.subscribe((val) => {
      this.storeDiscounts = val;
    });
    storeService.pristineDiscountsForCurrentStore$.subscribe((val) => {
      this.pristineStoreDiscounts = val;
    });
    storeService.pristineProductsForCurrentStore$.subscribe((val) => {
      this.products = val;
    });

    storeService.currentStoreLayout$.subscribe((val) => {
      this.storeLayout = val;
    });
  }

  deleteHappyHour(happyHour: happyHour) {
    //create a new store procedure called deleteDiscountForStore(happyHour)
    //would send signal to delete the db row.
    this.storeService.deleteHappyHourForStore(happyHour);
  }

  newHappyHour() {
    this.storeService.addHappyHourForStore();
  }

  editHappyHour(happyHour: happyHour, i: number) {
    //TEST TIME! can I have multiple nested matDialogs?
    //this.dialogRef.close();
    this.selectedHappyHourIndex = i;
    this.selectedHappyHour = structuredClone(happyHour);
    //console.log(this.selectedHappyHour);
    this.selectedUnmodifiedHappyHour = structuredClone(happyHour);
    if (
      this.selectedUnmodifiedHappyHour.hhStart &&
      this.selectedUnmodifiedHappyHour.hhEnd
    ) {
      var hhStart = new Date(
        this.selectedUnmodifiedHappyHour.hhStart.toString(),
      );
      var hhEnd = new Date(this.selectedUnmodifiedHappyHour.hhEnd.toString());
      this.editHappyHourStartHour = hhStart.getHours() as number;
      this.editHappyHourStartMinute = hhStart.getMinutes() as number;
      this.editHappyHourEndHour = hhEnd.getHours() as number;
      this.editHappyHourEndMinute = hhEnd.getMinutes() as number;
      this.mode = "editHappyHour";

      //NEED TO POPULATE the selectedHHDiscountType array for each item inside of the arrays of the hhDetail object
      this.updateSelectedHHDiscountType();
    }
  }

  cancelEditHappyHour() {
    this.mode = "displayDiscount";
    this.selectedHappyHour = this.selectedUnmodifiedHappyHour;
  }

  confirmEditHappyHour() {
    //run checks to see if values for start and end hours/minutes were changed.
    //run checks to see if value for hhtypeEnum was changed.
    //run checks to see if value for hhdetail was changed (TO BE IMPLEMENTED!)
    this.mode = "displayDiscount";
    let index: number = 0;
    let newHappyHourArray: Array<happyHour> = [];
    if (
      this.selectedHappyHour &&
      this.selectedHappyHour.hhStart &&
      this.selectedHappyHour.hhEnd
    ) {
      this.selectedHappyHour.hhStart = new Date(this.selectedHappyHour.hhStart);
      this.selectedHappyHour.hhEnd = new Date(this.selectedHappyHour.hhEnd);
      this.selectedHappyHour.hhStart.setHours(this.editHappyHourStartHour);
      this.selectedHappyHour.hhStart.setMinutes(this.editHappyHourStartMinute);
      this.selectedHappyHour.hhEnd.setHours(this.editHappyHourEndHour);
      this.selectedHappyHour.hhEnd.setMinutes(this.editHappyHourEndMinute);
    }
    this.storeDiscounts.happyHour?.forEach((hh) => {
      if (index == this.selectedHappyHourIndex) {
        newHappyHourArray.push(this.selectedHappyHour);
      } else {
        newHappyHourArray.push(hh);
      }
      index++;
    });
    this.storeDiscounts.happyHour = newHappyHourArray;
  }

  selectedCouponTypeSet(val: string) {
    if (this.selectedCoupon && this.selectedCoupon.couponDetail)
      this.selectedCoupon.couponDetail.type = val;
  }

  deleteCategoryForSelectedCoupon(i) {
    if (this.selectedCoupon && this.selectedCoupon.couponDetail) {
      var count = 0;
      var newArray: Array<categoryEnum> = [];
      this.selectedCoupon.couponDetail?.categories?.forEach((val) => {
        if (count != i) {
          newArray.push(val);
        }
        count++;
      });
      this.selectedCoupon.couponDetail.categories = newArray;
    }
  }
  setCouponAllProducts(event) {
    if (event == "true") {
      if (this.selectedCoupon && this.selectedCoupon.couponDetail) {
        this.selectedCoupon.couponDetail.singleItem = true;
      }
    } else {
      if (this.selectedCoupon && this.selectedCoupon.couponDetail) {
        this.selectedCoupon.couponDetail.singleItem = false;
      }
    }
  }
  cancelEditCoupon() {
    this.mode = "displayDiscount";
    this.selectedCoupon = this.selectedUnmodifiedCoupon;
  }

  confirmEditCoupon() {
    var index: number = 0;
    var newCouponArray: Array<coupon> = [];
    this.storeDiscounts.coupon?.forEach((coupon) => {
      if (index == this.selectedCouponIndex) {
        newCouponArray.push(this.selectedCoupon);
      } else {
        newCouponArray.push(coupon);
      }
      index++;
    });
    this.storeDiscounts.coupon = newCouponArray;
    this.mode = "displayDiscount";
  }

  toggleTable(index: number) {
    if (
      this.selectedHappyHour &&
      this.selectedHappyHour.hhDetail &&
      this.selectedHappyHour.hhDetail.happyHourItemList
    ) {
      this.selectedHappyHour.hhDetail.happyHourItemList[index].id = undefined;
    }
  }

  toggleBXGOTable(index: number) {
    if (
      this.selectedHappyHour &&
      this.selectedHappyHour.hhDetail &&
      this.selectedHappyHour.hhDetail.happyHourBXGO
    ) {
      this.selectedHappyHour.hhDetail.happyHourBXGO.products[index].id =
        undefined;
    }
  }

  selectProductForIndividualProductsHappyHour(product: any, index: number) {
    if (
      this.selectedHappyHour &&
      this.selectedHappyHour.hhDetail &&
      this.selectedHappyHour.hhDetail.happyHourItemList
    ) {
      this.selectedHappyHour.hhDetail.happyHourItemList[index] = product;
      this.selectedHappyHour.hhDetail.happyHourItemList[index].name =
        product.name;
    }
  }

  selectProductForBXGO(product: any, index: number) {
    if (
      this.selectedHappyHour &&
      this.selectedHappyHour.hhDetail &&
      this.selectedHappyHour.hhDetail.happyHourBXGO
    ) {
      this.selectedHappyHour.hhDetail.happyHourBXGO.products[index] = product;
      //console.log(this.selectedHappyHour.hhDetail.happyHourBXGO);
    }
  }

  deleteCoupon(coupon: coupon) {
    this.storeService.deleteCouponForStore(coupon);
  }

  editCoupon(coupon: coupon, i: number) {
    this.mode = "editCoupon";

    this.selectedCouponIndex = i;
    this.selectedCoupon = structuredClone(coupon);
    // (this.selectedHappyHour.hhType);
    this.selectedUnmodifiedCoupon = structuredClone(coupon);
  }

  newCoupon() {
    this.storeService.addCouponForStore();
  }

  discountTypeSet(val: string, i: number, obj: hhCategory | hhItem) {
    this.selectedHHDiscountType[i] = val;
    if (val == "priceSet") {
      obj.discount = null;
    } else {
      obj.priceSet = null;
    }
  }

  updateSelectedHHDiscountType() {
    this.selectedHHDiscountType = [];
    switch (this.selectedHappyHour.hhType) {
      case hhTypeEnum.bySpecificItem:
        this.selectedHappyHour.hhDetail?.happyHourItemList?.forEach((item) => {
          if (item.discount != null) {
            this.selectedHHDiscountType.push("discount");
          } else {
            this.selectedHHDiscountType.push("priceSet");
          }
        });
        break;
      case hhTypeEnum.category:
        this.selectedHappyHour.hhDetail?.happyHourCategoryList?.forEach(
          (item) => {
            if (item.discount != null) {
              this.selectedHHDiscountType.push("discount");
            } else {
              this.selectedHHDiscountType.push("priceSet");
            }
          },
        );
        break;
    }
  }

  deleteCategory(category: hhCategory) {
    var output: Array<hhCategory> = [];
    if (
      this.selectedHappyHour &&
      this.selectedHappyHour.hhDetail &&
      this.selectedHappyHour.hhDetail.happyHourCategoryList &&
      this.selectedHappyHour.hhDetail.happyHourCategoryList.length == 1
    ) {
      //CANNOT REMOVE CATEGORY! THERE IS ONLY 1 IN THIS HAPPY HOUR!
    } else if (
      this.selectedHappyHour &&
      this.selectedHappyHour.hhDetail &&
      this.selectedHappyHour.hhDetail.happyHourCategoryList
    ) {
      this.selectedHappyHour.hhDetail?.happyHourCategoryList?.forEach(
        (categoryObject) => {
          if (category === categoryObject) {
            //found the one that needs to be deleted;
          } else {
            output.push(categoryObject);
          }
        },
      );
      this.selectedHappyHour.hhDetail.happyHourCategoryList = output;
    }
  }

  createNewCategory() {
    var newCat: hhCategory = {
      id: categoryEnum.Edibles,
      discount: null,
      priceSet: null,
    };
    if (
      this.selectedHappyHour.hhDetail &&
      !this.selectedHappyHour.hhDetail.happyHourCategoryList
    ) {
      this.selectedHappyHour.hhDetail.happyHourCategoryList = [];
    }
    this.selectedHappyHour.hhDetail?.happyHourCategoryList?.push(newCat);
    this.updateSelectedHHDiscountType();
  }

  createNewCouponCategory() {
    var newCat: categoryEnum = categoryEnum.Edibles;
    if (
      this.selectedCoupon.couponDetail &&
      !this.selectedCoupon.couponDetail.categories
    ) {
      this.selectedCoupon.couponDetail.categories = [];
    }
    this.selectedCoupon.couponDetail?.categories?.push(newCat);
    //this.updateSelectedHHDiscountType();
  }

  addNewProductToCoupon() {
    var newItem: hhItem = {
      id: this.products[0].id,
      name: this.products[0].name,
      discount: null,
      priceSet: null,
    };
    if (
      this.selectedCoupon.couponDetail &&
      !this.selectedCoupon.couponDetail.product
    ) {
      this.selectedCoupon.couponDetail.product = [];
    }
    this.selectedCoupon.couponDetail?.product?.push(newItem);
  }

  deleteItem(item) {
    var output: Array<hhItem> = [];
    if (
      this.selectedHappyHour &&
      this.selectedHappyHour.hhDetail &&
      this.selectedHappyHour.hhDetail.happyHourItemList &&
      this.selectedHappyHour.hhDetail.happyHourItemList.length == 1
    ) {
      //CANNOT REMOVE CATEGORY! THERE IS ONLY 1 IN THIS HAPPY HOUR!
    } else if (
      this.selectedHappyHour &&
      this.selectedHappyHour.hhDetail &&
      this.selectedHappyHour.hhDetail.happyHourItemList
    ) {
      this.selectedHappyHour.hhDetail?.happyHourItemList?.forEach((obj) => {
        if (item === obj) {
          //found the one that needs to be deleted;
        } else {
          output.push(obj);
        }
      });
      this.selectedHappyHour.hhDetail.happyHourItemList = output;
    }
  }

  deleteBXGOItem(item) {
    var output: Array<hhItem> = [];
    if (
      this.selectedHappyHour &&
      this.selectedHappyHour.hhDetail &&
      this.selectedHappyHour.hhDetail.happyHourBXGO &&
      this.selectedHappyHour.hhDetail.happyHourBXGO.products.length == 1
    ) {
      //CANNOT REMOVE CATEGORY! THERE IS ONLY 1 IN THIS HAPPY HOUR!
    } else if (
      this.selectedHappyHour &&
      this.selectedHappyHour.hhDetail &&
      this.selectedHappyHour.hhDetail.happyHourBXGO &&
      this.selectedHappyHour.hhDetail.happyHourBXGO.products
    ) {
      this.selectedHappyHour.hhDetail?.happyHourBXGO.products.forEach((obj) => {
        if (item === obj) {
          //found the one that needs to be deleted;
        } else {
          output.push(obj);
        }
      });
      this.selectedHappyHour.hhDetail.happyHourBXGO.products = output;
    }
  }

  deleteProductFromCoupon(item) {
    var output: Array<hhItem> = [];

    if (
      this.selectedCoupon &&
      this.selectedCoupon.couponDetail &&
      this.selectedCoupon.couponDetail.product &&
      this.selectedCoupon.couponDetail.product.length == 1
    ) {
      //CANNOT REMOVE CATEGORY! THERE IS ONLY 1 IN THIS HAPPY HOUR!
    } else if (
      this.selectedCoupon &&
      this.selectedCoupon.couponDetail &&
      this.selectedCoupon.couponDetail.product
    ) {
      this.selectedCoupon.couponDetail?.product?.forEach((obj) => {
        if (item === obj) {
          //found the one that needs to be deleted;
        } else {
          output.push(obj);
        }
      });
      this.selectedCoupon.couponDetail.product = output;
    }
  }

  createNewItem() {
    var newItem: hhItem = {
      id: this.products[0].id,
      name: this.products[0].name,
      discount: null,
      priceSet: null,
    };
    if (
      this.selectedHappyHour.hhDetail &&
      !this.selectedHappyHour.hhDetail.happyHourItemList
    ) {
      this.selectedHappyHour.hhDetail.happyHourItemList = [];
    }
    this.selectedHappyHour.hhDetail?.happyHourItemList?.push(newItem);
    this.updateSelectedHHDiscountType();
  }

  createNewBXGOItem() {
    var newProduct = this.products[0];
    if (
      this.selectedHappyHour.hhDetail &&
      !this.selectedHappyHour.hhDetail.happyHourBXGO
    ) {
      this.selectedHappyHour.hhDetail.happyHourBXGO = {
        products: [],
        triggerCount: 0,
      };
    }
    this.selectedHappyHour.hhDetail?.happyHourBXGO?.products.push(newProduct);
    this.updateSelectedHHDiscountType();
  }

  confirmEditDiscounts() {
    //Create a "store" object that will get passed down to POS_stores table.
    //need store ID
    //need store discounts
    //need store name
    //this.wordpressService.updateStore

    var storeUpdate: any = {
      id: this.storeId,
      name: this.storeLocationName.location,
      discounts: JSON.stringify(this.storeDiscounts),
      layout: JSON.stringify(this.storeLayout),
    };
    this.wordpressService.updateStore(storeUpdate);
    this.storeService.reEnableOdoo();
    this.storeService.setDiscountsForStore(this.storeDiscounts);
    this.close();
  }

  cancelEditDiscounts() {
    this.storeService.setDiscountsForStore(this.pristineStoreDiscounts);
    this.close();
  }

  showProductList(index) {
    //set logic to recall what item is being modified?
    this.selectedCouponProductIndex = index;
    this.isProductListVisible = true;
  }

  hideProductList(product) {
    // update the selected product here
    if (this.selectedCoupon.couponDetail?.product) {
      this.selectedCoupon.couponDetail.product[
        this.selectedCouponProductIndex
      ] = product;
    }
    this.isProductListVisible = false;
  }

  close() {
    this.dialogRef.close();
  }
}
