import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { storeLocationEnum } from "../../models/storeLocation";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-create-session-modal",
  standalone: true,
  imports: [MatIcon, FormsModule, CommonModule],
  templateUrl: "./create-session-modal.component.html",
  styleUrl: "./create-session-modal.component.css",
})
export class CreateSessionModalComponent {
  storeLocation: storeLocationEnum = storeLocationEnum.none;
  cashAmt: number = 0;
  constructor(
    public dialogRef: MatDialogRef<CreateSessionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.cashAmt = data.cashInRegister;
  }
  close(state: string | number = "cancel") {
    this.dialogRef.close(state);
  }
}
