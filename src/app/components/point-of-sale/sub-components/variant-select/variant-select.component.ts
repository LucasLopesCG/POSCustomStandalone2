import { Component, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { product } from "../../../../models/product";
import { CurrentOrderService } from "../../../../services/current-order.service";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "app-variant-select",
  standalone: true,
  imports: [FormsModule, CommonModule, MatIcon],
  templateUrl: "./variant-select.component.html",
  styleUrl: "./variant-select.component.css",
})
export class VariantSelectComponent implements OnInit {
  selectedVariantGroup: Array<any> = [];
  constructor(
    private currentOrderService: CurrentOrderService,
    public dialogRef: MatDialogRef<VariantSelectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}
  ngOnInit() {
    // will log the entire data object
    // (this.data)
    this.selectedVariantGroup = this.data;
  }

  addProductToOrder(event: any) {
    //trigger logic to lower the count of the stock inside of the local track of product for the chosen product
    //call logic to add product to the current-order component's order array
    // (event);
    // ("pause and check!");
    if (event.stock > 0) this.currentOrderService.addItemToOrder(event);
    //this.modalService.close();
  }

  close() {
    this.dialogRef.close();
  }
}
