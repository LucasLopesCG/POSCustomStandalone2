import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { storeLocationEnum } from "../../models/storeLocation";

@Component({
  selector: "app-create-session-modal",
  standalone: true,
  imports: [MatIcon, FormsModule, CommonModule],
  templateUrl: "./create-session-modal.component.html",
  styleUrl: "./create-session-modal.component.css",
})
export class CreateSessionModalComponent {
  storeLocation: storeLocationEnum = storeLocationEnum.none;
  constructor(public dialogRef: MatDialogRef<CreateSessionModalComponent>) {}
  close() {
    this.dialogRef.close();
  }
}
