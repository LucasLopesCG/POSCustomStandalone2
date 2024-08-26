import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { CurrentOrderService } from "../../../../services/current-order.service";
import { OdooService } from "../../../../services/odoo.service";
import {
  MatCell,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatRow,
  MatTable,
} from "@angular/material/table";

@Component({
  selector: "app-product-stock-information-modal",
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatIcon,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatCell,
    MatHeaderRow,
    MatRow,
  ],
  templateUrl: "./product-stock-information-modal.component.html",
  styleUrl: "./product-stock-information-modal.component.css",
})
export class ProductStockInformationModalComponent {
  columns: Array<any> = [];
  productStockInfo: any = {};
  productStockFiltered: any = {};
  productStockInfoFinal: any = {};
  searchName: string = "";
  isLoading: boolean = true;
  constructor(
    public dialogRef: MatDialogRef<ProductStockInformationModalComponent>,
    private odooService: OdooService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.searchName = data;
    odooService.productStockInfo$.subscribe((val) => {
      this.productStockInfo = val;
      this.productStockFiltered = [];
      if (this.productStockInfo && this.productStockInfo.length > 0) {
        //this.searchName = this.productStockInfo.name;
        this.productStockInfo.forEach((productGroup) => {
          var stock_quantities = Object.entries(
            productGroup.stock_quantities,
          ) as any;
          stock_quantities.forEach((stock) => {
            var stockInfo = {
              name: stock[1].product_id[1],
              location: stock[1].location_id[1],
              quantity: stock[1].quantity,
            };
            if (stockInfo.location.includes("Stock") && stockInfo.quantity > 0)
              this.productStockFiltered.push(stockInfo);
          });
        });
      }
      this.productStockInfoFinal = [];
      var productVariantName: string = "";
      this.productStockInfoFinal = this.productStockFiltered;
      this.productStockFiltered = this.groupProductsByName(
        this.productStockFiltered,
      );
      var finalDisplayArray: Array<any> = [];
      this.productStockFiltered.forEach((productGroup) => {
        var arrayVal: any = {};
        arrayVal.name = productGroup.name;
        arrayVal.locations = [];
        var locationValuePair = Object.entries(productGroup.locations) as any;
        locationValuePair.forEach((val) => {
          var locationName: string = "";
          if (val[0].includes("WEB")) {
            locationName = "Online";
          } else if (val[0].includes("SANFO")) {
            locationName = "Sanford";
          } else if (val[0].includes("ORL")) {
            locationName = "Orlando";
          } else if (val[0].includes("APS")) {
            locationName = "Apopka";
          } else if (val[0].includes("DL")) {
            locationName = "DeLand";
          }
          arrayVal.locations.push({ location: locationName, quantity: val[1] });
        });
        finalDisplayArray.push(arrayVal);
      });
      this.productStockInfoFinal = finalDisplayArray;
      this.columns = [
        "productName",
        ...this.getLocations(this.productStockInfoFinal),
      ];
      this.isLoading = false; // Set loading to false after processing data
    });
  }
  close() {
    //Need to send out a command here that stores how many $1 discounts were applied.
    //These translate as adding coupons to the order?
    this.dialogRef.close();
  }

  groupProductsByName(products: any[]): any[] {
    const productMap: { [name: string]: { [location: string]: number } } = {};

    products.forEach((product) => {
      const { name, location, quantity } = product;

      if (!productMap[name]) {
        productMap[name] = {};
      }

      if (!productMap[name][location]) {
        productMap[name][location] = 0;
      }

      productMap[name][location] += quantity;
    });

    return Object.keys(productMap).map((name) => ({
      name,
      locations: productMap[name],
    }));
  }

  getLocations(productStockInfoFinal: any[]): string[] {
    const locationsSet = new Set<string>();
    productStockInfoFinal.forEach((productStock) =>
      productStock.locations.forEach((location) =>
        locationsSet.add(location.location),
      ),
    );
    return Array.from(locationsSet);
  }

  getQuantity(productStock: any, location: string): number {
    const loc = productStock.locations.find((loc) => loc.location === location);
    return loc ? loc.quantity : null;
  }
}
