import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { OdooService } from "../../../../services/odoo.service";
import { storeService } from "../../../../services/storeService";

@Component({
  selector: "app-change-tax-rate-modal",
  standalone: true,
  imports: [FormsModule, CommonModule, MatIcon],
  templateUrl: "./change-tax-rate-modal.component.html",
  styleUrl: "./change-tax-rate-modal.component.css",
})
export class ChangeTaxRateModalComponent {
  locationName: string = "";
  configIds: any = {};
  selectedTaxRateVal: any = {};
  availableTaxRates: Array<any> = [];
  displayTaxRates: Array<number> = [];
  selectedTaxRate: number = 0;
  constructor(
    public dialogRef: MatDialogRef<ChangeTaxRateModalComponent>,
    private odooService: OdooService,
    private storeService: storeService,
  ) {
    odooService.configIds$.subscribe((val) => {
      this.configIds = val;
      this.updateTaxRatesToDisplay();
    });
    storeService.dataSelectedStoreLocation$.subscribe((val) => {
      this.locationName = val.location;
      this.updateTaxRatesToDisplay();
    });
    storeService.taxRateForStore$.subscribe((val) => {
      this.selectedTaxRate = val;
    });
    odooService.taxRates$.subscribe((val) => {
      this.availableTaxRates = val;
      this.updateTaxRatesToDisplay();
    });
  }

  updateTaxRatesToDisplay() {
    if (
      this.configIds &&
      this.configIds.length > 0 &&
      this.availableTaxRates &&
      this.availableTaxRates.length > 0 &&
      this.locationName != ""
    ) {
      var availableRates: any = [];
      this.configIds.forEach((configId) => {
        if (
          configId.name.toLowerCase().includes(this.locationName.toLowerCase())
        ) {
          var allowedTaxRates = configId.fiscal_position_ids;
          allowedTaxRates.forEach((taxRateId) => {
            this.availableTaxRates.forEach((availableTaxRate) => {
              if (taxRateId == availableTaxRate.id) {
                availableRates.push(availableTaxRate.tax_dest_id[1]);
                availableRates.push(availableTaxRate.tax_src_id[1]);
              }
            });
          });
        }
      });
      availableRates = [...new Set(availableRates)];
      var finalAvailableRates: Array<any> = [];
      availableRates.forEach((rate) => {
        var numRate = rate.split("%")[0];
        var num = +numRate / 100;
        finalAvailableRates.push(num);
      });
      this.displayTaxRates = finalAvailableRates;
    }
  }
  selectNewTaxRate(num) {
    this.selectedTaxRate = num;
  }

  updateTaxRate() {
    this.storeService.setTaxRateForStore(this.selectedTaxRate);
    this.close();
  }

  close() {
    //Need to send out a command here that stores how many $1 discounts were applied.
    //These translate as adding coupons to the order?
    this.dialogRef.close();
  }
}
