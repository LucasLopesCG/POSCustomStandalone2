import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "app-split-order-modal",
  standalone: true,
  imports: [FormsModule, CommonModule, MatIcon],
  templateUrl: "./split-order-modal.component.html",
  styleUrl: "./split-order-modal.component.css",
})
export class SplitOrderModalComponent {
  constructor(public dialogRef: MatDialogRef<SplitOrderModalComponent>) {}
  close() {
    //Need to send out a command here that stores how many $1 discounts were applied.
    //These translate as adding coupons to the order?
    this.dialogRef.close();
  }

  splitAndMakeOrders() {}
}
