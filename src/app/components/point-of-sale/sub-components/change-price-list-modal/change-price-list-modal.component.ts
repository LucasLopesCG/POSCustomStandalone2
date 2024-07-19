import { Component } from "@angular/core";
import { OdooService } from "../../../../services/odoo.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { MatDialogRef } from "@angular/material/dialog";
import { storeService } from "../../../../services/storeService";

@Component({
  selector: "app-change-price-list-modal",
  standalone: true,
  imports: [FormsModule, CommonModule, MatIcon],
  templateUrl: "./change-price-list-modal.component.html",
  styleUrl: "./change-price-list-modal.component.css",
})
export class ChangePriceListModalComponent {
  selectedPriceListVal: any = {};
  availablePriceList: Array<any> = [];
  locationName: string = "";
  priceListData: Array<any> = [];
  displayPriceLists: Array<any> = [];
  stockFilter: string = "";
  constructor(
    public dialogRef: MatDialogRef<ChangePriceListModalComponent>,
    private odooService: OdooService,
    private storeService: storeService,
  ) {
    storeService.availablePriceLists$.subscribe((val) => {
      this.availablePriceList = val;
      this.odooService.fetchPriceListNames();
    });
    storeService.selectedPriceList$.subscribe((val) => {
      this.selectedPriceListVal = val;
    });
    storeService.dataSelectedStoreLocation$.subscribe((val) => {
      this.locationName = val.location;
    });
    storeService.stockFilter$.subscribe((val) => {
      this.stockFilter = val;
    });
    odooService.priceListData$.subscribe((val) => {
      this.priceListData = val;
      this.priceListData.forEach((data) => {
        this.availablePriceList.forEach((subPriceList) => {
          if (subPriceList == data.id) {
            var newObj = {
              id: data.id,
              name: data.name,
            };
            this.displayPriceLists.push(newObj);
          }
        });
      });
    });
  }
  selectePriceList(event) {
    console.log(event);
    this.selectedPriceListVal = event.id;
  }
  updateChosenPriceList() {
    this.storeService.setCurrentPriceList(this.selectedPriceListVal);
    //now call odoo service to fetch product data again (need to recalculate prices based on selected pricelist)
    this.odooService.getCombinedProductData(
      this.stockFilter,
      this.selectedPriceListVal,
    );
    this.close();
  }
  close() {
    //Need to send out a command here that stores how many $1 discounts were applied.
    //These translate as adding coupons to the order?
    this.dialogRef.close();
  }
}
