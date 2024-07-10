import {
  AfterContentInit,
  Component,
  inject,
  Injectable,
  OnInit,
  ViewChild,
} from "@angular/core";
import { storeService } from "../../../../services/storeService";
import { product } from "../../../../models/product";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CurrentOrderService } from "../../../../services/current-order.service";
import { MatDialogRef } from "@angular/material/dialog";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { StoreDiscountSettingsComponent } from "../store-discount-settings/store-discount-settings.component";
import { VariantSelectComponent } from "../variant-select/variant-select.component";
import { hhTypeEnum } from "../../../../models/hhTypeEnum";
import { couponTypeEnum } from "../../../../models/couponTypeEnum";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatLabel } from "@angular/material/form-field";
import { MatFormField } from "@angular/material/form-field";
import { MatSelect } from "@angular/material/select";
import { MatOption } from "@angular/material/select";
import { MatIcon } from "@angular/material/icon";
import { categoryEnum } from "../../../../models/categoryEnum";
import { OdooService } from "../../../../services/odoo.service";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { DomSanitizer } from "@angular/platform-browser";
@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatLabel,
    MatFormField,
    MatSelect,
    MatOption,
    MatIcon,
    MatTableModule,
    MatSortModule,
    MatProgressSpinnerModule,
  ],
  providers: [{ provide: MatDialogRef, useValue: {} }],
  templateUrl: "./product-list.component.html",
  styleUrl: "./product-list.component.css",
})
export class ProductListComponent implements AfterContentInit {
  sampleImage: any = {};
  odooProducts: Array<any> = [];
  odooStocks: Array<any> = [];
  isLoading: boolean = true;
  isProductLoading: boolean = true;
  productsLoaded: boolean = false;
  stocksLoaded: boolean = false;
  isDiscountLoading: boolean = true;
  odooRequest: boolean = false;
  stockFilter: string = "";
  @ViewChild(MatSort) sort?: MatSort;
  categories = categoryEnum;
  filteredCat: Array<categoryEnum> = [];
  selectedCategory: categoryEnum | string = "ALL";
  categoryIconList: Array<string> = [];
  availableDiscounts: any = {};
  happyHourFlag: boolean = false;
  selectedLocation: any = null;
  private dialog = inject(MatDialog);
  productsForCurrentLocation: Array<product> = [];
  productsForCurrentLocationNoDiscounts: Array<product> = [];
  productsSeparatedIntoVariants: Array<Array<product>> = [];
  showOutOfStock = false;
  searchString: string = "";
  selectedVariantGroup: Array<product> = [];
  filteredProducts: Array<Array<product>> = [];
  constructor(
    private storeService: storeService,
    private currentOrderService: CurrentOrderService,
    private odooService: OdooService,
    private sanitizer: DomSanitizer,
  ) {
    //checks for happy hour being triggered every minute
    const seconds = 60; // Call function every 60 seconds
    setInterval(() => {
      console.log("running minute check");
      this.separateCouponsAndHappyHour();
      this.createVariantGroups();
      this.filterByCategory(this.selectedCategory);
    }, seconds * 1000);
    odooService.combinedProductData$.subscribe((val) => {
      if (val && val.length > 0) {
        this.productsForCurrentLocationNoDiscounts = val;
        this.storeService.setProductsForStore(val);
        this.isProductLoading = false;
        this.determineLoadingStatus();
        this.separateCouponsAndHappyHour();
        this.createVariantGroups();
        this.determineAvailableCategories();
        this.filterByCategory(this.selectedCategory);
      }
    });
    storeService.enableOdooCalls$.subscribe((val) => {
      if (val != false) {
        this.isProductLoading = true;
        this.productsForCurrentLocation =
          this.productsForCurrentLocationNoDiscounts;
        this.storeService.setProductsForStore(this.productsForCurrentLocation);
        this.isProductLoading = false;
        this.determineLoadingStatus();
        this.separateCouponsAndHappyHour();
        this.createVariantGroups();
        this.determineAvailableCategories();
        this.filterByCategory(this.selectedCategory);
      }
    });
    storeService.discountsForCurrentStore$.subscribe((val) => {
      if (val) {
        this.isLoading = true;
        this.isDiscountLoading = true;
        this.availableDiscounts = val;
        this.isDiscountLoading = false;
        this.determineLoadingStatus();
        this.separateCouponsAndHappyHour();
      }
    });

    storeService.dataSelectedStoreLocation$.subscribe((val) => {
      this.selectedLocation = val;
    });
    storeService.categoryIcons$.subscribe((val) => {
      this.categoryIconList = val;
    });
    storeService.productsForCurrentStore$.subscribe((val) => {
      console.log(val);
      this.productsForCurrentLocation = val;
      this.createVariantGroups();
      this.determineAvailableCategories();
      this.filterByCategory(this.selectedCategory);
    });
  }
  ngAfterContentInit(): void {
    // if()
    // this.determineLoadingStatus();
  }

  sanitizeImage(imageUrl: string | undefined) {
    if (typeof imageUrl == "string")
      return this.sanitizer.bypassSecurityTrustUrl(imageUrl);
    return "";
  }

  determineAvailableCategories() {
    var newCat: Array<categoryEnum> = [];
    const values = Object.values(this.categories);
    values.forEach((element) => {
      var foundCat: Array<any> = [];
      this.productsSeparatedIntoVariants.forEach((productGroup) => {
        productGroup.forEach((product) => {
          if (product.category && product.category.length > 0) {
            product.category.forEach((cat) => {
              cat = categoryEnum[(cat as string).replace(/\s/g, "")];
            });
          }
          if (product.category && product.category.length > 0) {
            product.category.forEach((cat) => {
              if (cat.toString() == element.toString()) {
                foundCat.push(product);
              }
            });
            //includes(this.categories[element]
          }
        });
      });
      if (foundCat && foundCat.length > 0) {
        newCat.push(this.categories[(element as string).replace(/\s/g, "")]);
      }
    });
    this.filteredCat = newCat;
  }

  filterProducts(): void {
    if (this.searchString != "") this.selectedCategory = "ALL";
    this.filteredProducts = this.productsSeparatedIntoVariants.filter(
      (array) => {
        if (array && array[0] && array[0].name) {
          const productName = array[0].name.toLowerCase();
          const variantName = array[0].variantName
            ? array[0].variantName.toLowerCase()
            : "";
          const searchString = this.searchString.toLowerCase();
          return (
            productName.includes(searchString) ||
            variantName.includes(searchString)
          );
        } else {
          //const searchString = this.searchString.toLowerCase();
          return false;
        }
      },
    );
  }

  filterByCategory(category: string): void {
    category = category.replace(/\s/g, "");
    this.searchString = "";
    if (category == "ALL") {
      this.selectedCategory = category;
      this.filteredProducts = this.productsSeparatedIntoVariants;
    } else {
      this.selectedCategory = categoryEnum[category];
      var output = this.productsSeparatedIntoVariants.filter((array) => {
        var arrayContainsFlag: boolean = false;
        array.forEach((product) => {
          if (product.category?.includes(categoryEnum[category])) {
            arrayContainsFlag = true;
          }
        });
        return arrayContainsFlag;
      });
      output;
      this.filteredProducts = output;
    }
  }

  combineStockWithPriceList(priceListData) {
    this.odooStocks.forEach((stockItem) => {
      priceListData.forEach((priceListItem) => {
        if (priceListItem.product_id[0] == stockItem.product_id[0]) {
          stockItem.value = priceListItem.fixed_price;
        }
      });
    });
  }

  dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a, b) {
      /* next line works with strings and numbers,
       * and you may want to customize it to your needs
       */
      var result =
        a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
      return result * sortOrder;
    };
  }

  determineCategoryArray(odooProduct): Array<categoryEnum> {
    debugger;
    var output: Array<categoryEnum> = [];
    if (odooProduct && odooProduct.categ_id && odooProduct.categ_id[1]) {
      switch (odooProduct.categ_id[1]) {
        case "Pre-Rolls":
          output.push(categoryEnum.PreRoll);
          break;
        case "Strains":
          output.push(categoryEnum.Strains);
          break;
        case "Edibles":
          output.push(categoryEnum.Edibles);
          break;
        case "Concentrates":
          output.push(categoryEnum.Concentrates);
          break;
        case "All":
          if (odooProduct.display_name.toLowerCase().includes("Cartridge")) {
            output.push(categoryEnum.Cartridges);
            break;
          } else if (odooProduct.display_name.toLowerCase().includes("MG ")) {
            output.push(categoryEnum.Edibles);
            break;
          } else if (
            odooProduct.display_name.toLowerCase().includes("Chronic")
          ) {
            output.push(categoryEnum.Merch);
            break;
          } else {
            output.push(categoryEnum.Edibles);
          }
      }
    }
    return output;
  }

  createVariantGroups() {
    var isVariantGroup: boolean = false;
    var curVariantGroup: string = "";
    var finalOutput: Array<Array<product>> = [];
    var currentVariantArray: Array<product> = [];
    var currentProductGroupName: string = "";
    if (
      this.productsForCurrentLocation &&
      this.productsForCurrentLocation.length > 0
    ) {
      //STEP 1: clean the names:
      this.productsForCurrentLocation.forEach((product) => {
        var split = product.name?.split("] ");
        if (split && split[1]) {
          product.name = split[1];
        }
      });
      this.productsForCurrentLocation.sort(this.dynamicSort("name"));
      this.productsForCurrentLocation.forEach((product) => {
        currentProductGroupName = product.name?.split("(")[0]
          ? product.name?.split("(")[0]
          : "";
        if (curVariantGroup != currentProductGroupName) {
          curVariantGroup = currentProductGroupName;
          // (
          //"found new group name! Group name is: " + curVariantGroup,
          //);
          if (currentVariantArray.length > 0) {
            // ("adding current variant array to final output!");
            finalOutput.push(currentVariantArray);
          }
          //console.log("restting current variant Array");
          currentVariantArray = [];
        }
        currentVariantArray.push(product);
      });
      finalOutput.push(currentVariantArray);
      finalOutput.forEach((val) => {
        if (val.length > 1) {
          val.forEach((product) => {
            product.variantName = product.name?.split("(")[0];
          });
        }
      });

      this.productsSeparatedIntoVariants = finalOutput;
      this.filteredProducts = finalOutput;
      //console.log(this.productsSeparatedIntoVariants);
      this.filterProducts();
    }
  }

  totalProductCount(array) {
    var output: number = 0;
    array.forEach((product) => {
      output = output + product.stock;
    });
    return output;
  }

  addProductToOrder(event: any) {
    //trigger logic to lower the count of the stock inside of the local track of product for the chosen product
    //call logic to add product to the current-order component's order array
    // (event);
    // ("pause and check!");
    if (event.stock > 0) this.currentOrderService.addItemToOrder(event);
    //this.modalService.close();
  }

  openVariantModal(event: any) {
    // (event);
    this.selectedVariantGroup = event;
    this.dialog.open(VariantSelectComponent, {
      maxHeight: "90vh",
      data: this.selectedVariantGroup,
    });
  }

  openStoreDiscountSettings(event: any): void {
    this.dialog.open(StoreDiscountSettingsComponent, {
      data: "NO DATA PRESENT",
    });
  }

  separateCouponsAndHappyHour() {
    this.productsForCurrentLocation =
      this.productsForCurrentLocationNoDiscounts;
    this.happyHourFlag = false;
    if (this.availableDiscounts && this.availableDiscounts.happyHour) {
      if (this.availableDiscounts.happyHour.length == 0)
        this.happyHourFlag = false;
      this.availableDiscounts.happyHour.forEach((HH) => {
        if (HH.hhStart && HH.hhEnd) {
          var hhstart = new Date(HH.hhStart);
          var hhEnd = new Date(HH.hhEnd);
          //Now scan to see if this happy hour is active (compare start and end times, see if the current time falls between these 2 times)
          var hhHourStart = hhstart.getHours();
          var hhMinuteStart = hhstart.getMinutes();
          var hhSecondsStart = hhstart.getSeconds();
          var hhHourEnd = hhEnd.getHours();
          var hhMinuteEnd = hhEnd.getMinutes();
          var hhSecondsEnd = hhEnd.getSeconds();
          var currentTime = new Date();
          var startTime = new Date();
          startTime.setHours(hhHourStart);
          startTime.setMinutes(hhMinuteStart);
          startTime.setSeconds(hhSecondsStart);
          var endTime = new Date();
          endTime.setHours(hhHourEnd);
          endTime.setMinutes(hhMinuteEnd);
          endTime.setSeconds(hhSecondsEnd);

          if (startTime <= currentTime && currentTime <= endTime) {
            //WITHIN HAPPY HOUR!! This should fire off the storeService's HappyHour flag.
            this.happyHourFlag = true;
            //this will fire off the storeService to update values of eligible items. But first to determine what needs to be changed!
            //Scanning a happy hour, determine what type of happy hour it is:
            switch (HH.hhType) {
              case hhTypeEnum.allProducts:
                //scan the hh.hhDetail json to apply the discount accross everything
                //WORK HERE
                var newPrice: number | null = null;
                this.productsForCurrentLocation.forEach((product) => {
                  this.storeService.updateProductWithHHPrice({
                    id: product.id as number,
                    discount: HH.hhDetail.happyHourDiscountAll,
                    newPrice: newPrice,
                  });
                });
                break;
              case hhTypeEnum.bySpecificItem:
                //scan the hh.hhdetail json to find list of products, then
                HH.hhDetail.happyHourItemList.forEach((product) => {
                  var id = product.id;
                  var discount = product.discount;
                  var newPrice = product.priceSet;

                  //Call the store service to go through the array of products from the store, scan through them to find matching item and change the value
                  this.storeService.updateProductWithHHPrice({
                    id: id,
                    discount: discount,
                    newPrice: newPrice,
                  });
                });
                break;
              case hhTypeEnum.category:
                HH.hhDetail.happyHourCategoryList.forEach((category) => {
                  // (category);
                  var id = category.id;
                  var discount: number | null = null;
                  var newPrice: number | null = null;
                  if (category.discount) {
                    discount = category.discount;
                  } else {
                    newPrice = category.priceSet;
                  }
                  this.storeService.updateCategoryWithHHPrice({
                    id: id,
                    discount: discount,
                    newPrice: newPrice,
                  });
                });

                break;
              case hhTypeEnum.bxgo:
                HH.hhDetail.happyHourBXGO.products.forEach((product) => {
                  // (category);
                  var HHProduct = product;
                  var trigger: number = HH.hhDetail.happyHourBXGO.triggerCount;
                  this.storeService.updateProductWithBXGOData({
                    product: HHProduct,
                    bx: trigger,
                  });
                });
                break;
              // case hhTypeEnum.combo:
              //   break;
              default:
                console.log("ERROR!!! This should never happen!");
            }
          }
        }
      });
    } else {
      this.happyHourFlag = false;
    }
    if (this.availableDiscounts && this.availableDiscounts.coupon) {
      this.storeService.setCouponList([]);
      //This store has coupons!
      this.availableDiscounts.coupon.forEach((coupon) => {
        // switch(coupon.couponType){
        //   case couponTypeEnum.amountOffOrder:
        //     // this.storeService.
        //     break;
        //   case couponTypeEnum.discountOnEntireOrder:
        //     //
        //     break;
        //   case couponTypeEnum.discountOnProductCategory:
        //     //
        //     break;
        //   case couponTypeEnum.discountOnSpecificItem:
        //     //
        //     break;
        //   case couponTypeEnum.amountOffProduct:
        //     //
        //     break;
        // }
        //Call store service to add each coupon i find into the service.
        //current order component then allows user to select the coupon modal, select a coupon and add it to it's activecoupon object.
        //Create logic that calculates how much money is taken off from order as a result.
        this.storeService.addCouponToCouponList(coupon);
      });
    }
    this.storeService.setHappyHourFlag(this.happyHourFlag);
  }

  determineLoadingStatus() {
    if (!this.isProductLoading && !this.isDiscountLoading)
      this.isLoading = false;
  }
}
