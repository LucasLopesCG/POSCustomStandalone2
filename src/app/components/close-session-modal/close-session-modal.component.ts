import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { storeService } from "../../services/storeService";
import { userService } from "../../services/userService";
import { storeLocationEnum } from "../../models/storeLocation";
import { User } from "../../models/user";
import { offlineModeService } from "../../services/offlineMode.service";
import { order } from "../../models/order";

@Component({
  selector: "app-close-session-modal",
  standalone: true,
  imports: [MatIcon, FormsModule, CommonModule],
  templateUrl: "./close-session-modal.component.html",
  styleUrl: "./close-session-modal.component.css",
})
export class CloseSessionModalComponent {
  disableButton: boolean = false;
  selectedLocation: any = null;
  offlineOrderList: Array<order> = [];
  constructor(
    public dialogRef: MatDialogRef<CloseSessionModalComponent>,
    private storeService: storeService,
    private userService: userService,
    private offlineMode: offlineModeService,
  ) {
    storeService.dataSelectedStoreLocation$.subscribe((val) => {
      this.selectedLocation = val;
      // ("DATA SAVED: Selected location is:");
      // (this.selectedLocation);
      //Run logic here to gather information of the locations the user has access to:
    });
    offlineMode.orderList$.subscribe((val) => {
      this.disableButton = false;
      this.offlineOrderList = val;
      if (this.offlineOrderList.length > 0) {
        this.disableButton = true;
      }
    });
  }

  close() {
    this.dialogRef.close();
  }

  endSessionStore() {
    //Call something here to say that the session is over?
    //Set selected location to none
    this.storeService.setCurrentStore(storeLocationEnum.none);
    this.close();
  }

  endSessionRestaurant() {
    this.storeService.setCurrentStore(storeLocationEnum.none);
    this.close();
  }

  createExport() {
    let res = JSON.stringify(this.offlineOrderList);
    const blob = new Blob([res], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    window.open(url);
    this.disableButton = false;
  }
}
