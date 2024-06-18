import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { userService } from "./../../../../../services/userService";
import { storeService } from "./../../../../../services/storeService";
import { happyHour } from "../../../../../models/happyHour";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { hhTypeEnum } from "../../../../../models/hhTypeEnum";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "app-edit-happy-hour",
  standalone: true,
  imports: [BrowserModule, FormsModule, MatIcon],
  templateUrl: "./edit-happy-hour.component.html",
  styleUrl: "./edit-happy-hour.component.css",
})
export class EditHappyHourComponent {
  editHappyHour: happyHour = {};
  editHappyHourStartHour?: number = undefined;
  editHappyHourStartMinute?: number = undefined;
  editHappyHourEndHour?: number = undefined;
  editHappyHourEndMinute?: number = undefined;
  editHappyHourCategory?: hhTypeEnum;

  originalHappyHour: happyHour = {};
  editFlag = false;
  constructor(
    public dialogRef: MatDialogRef<EditHappyHourComponent>,
    private userService: userService,
    @Inject(MAT_DIALOG_DATA) public data: happyHour,
    private storeService: storeService,
  ) {
    this.originalHappyHour = data;
    this.editHappyHour = data;
    this.editHappyHourStartHour = this.originalHappyHour.hhStart?.getHours();
    this.editHappyHourStartMinute =
      this.originalHappyHour.hhStart?.getMinutes();
    this.editHappyHourEndHour = this.originalHappyHour.hhEnd?.getHours();
    this.editHappyHourEndMinute = this.originalHappyHour.hhEnd?.getMinutes();
  }
  close() {
    this.dialogRef.close();
  }
}
