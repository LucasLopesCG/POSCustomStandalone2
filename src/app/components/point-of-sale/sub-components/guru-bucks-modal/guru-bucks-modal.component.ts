import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { customerService } from "../../../../services/customerService";
import { CurrentOrderService } from "../../../../services/current-order.service";

@Component({
  selector: "app-guru-bucks-modal",
  standalone: true,
  imports: [FormsModule, CommonModule, MatIcon],
  templateUrl: "./guru-bucks-modal.component.html",
  styleUrl: "./guru-bucks-modal.component.css",
})
export class GuruBucksModalComponent {
  selectedCustomer: any = {};
  pristineGBAmmount: number = 0;
  usedGB: number = 0;

  constructor(
    public dialogRef: MatDialogRef<GuruBucksModalComponent>,
    private customerService: customerService,
    private orderService: CurrentOrderService,
  ) {
    customerService.selectedCustomer$.subscribe((val) => {
      this.selectedCustomer = val;
      this.pristineGBAmmount = val.guruBucks as number;
    });
  }

  useRewards() {
    this.usedGB += 20;
    this.pristineGBAmmount -= 20;
  }

  refundRewards() {
    this.usedGB -= 20;
    this.pristineGBAmmount += 20;
  }

  close() {
    //Need to send out a command here that stores how many $1 discounts were applied.
    //These translate as adding coupons to the order?
    this.orderService.setOrderGBUsed(this.usedGB);
    this.dialogRef.close();
  }
}
