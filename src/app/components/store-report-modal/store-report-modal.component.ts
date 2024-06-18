import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "app-store-report-modal",
  standalone: true,
  imports: [MatIcon, FormsModule, CommonModule],
  templateUrl: "./store-report-modal.component.html",
  styleUrl: "./store-report-modal.component.css",
})
export class StoreReportModalComponent {
  constructor(public dialogRef: MatDialogRef<StoreReportModalComponent>) {}
  close() {
    this.dialogRef.close();
  }
}
