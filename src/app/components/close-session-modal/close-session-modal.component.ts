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
import { OdooService } from "../../services/odoo.service";

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
  cashCloseAmount: number = 0;
  expectedCashAmt: number = 0;
  sessionId: number = -1;
  sessionCloseNotes: string = "";
  sessionOrderCount: number = -99;
  constructor(
    public dialogRef: MatDialogRef<CloseSessionModalComponent>,
    private storeService: storeService,
    private userService: userService,
    private offlineMode: offlineModeService,
    private odooService: OdooService,
  ) {
    storeService.dataSelectedStoreLocation$.subscribe((val) => {
      this.selectedLocation = val;
    });
    offlineMode.orderList$.subscribe((val) => {
      this.disableButton = false;
      this.offlineOrderList = val;
      if (this.offlineOrderList.length > 0) {
        this.disableButton = true;
      }
    });
    odooService.sessionId$.subscribe((val) => {
      if (val) {
        this.sessionId = val;
        this.odooService.getSessionOrderCountById(this.sessionId);
      }
    });
    odooService.sessionOrderCount$.subscribe((val) => {
      if (val) {
        this.sessionOrderCount = val;
      }
    });
    userService.cashRegisterAmt$.subscribe((val) => {
      this.expectedCashAmt = val;
    });
  }

  closeSession(amt) {
    //send out signal to close the session.
    this.odooService.closeSession(this.sessionId, amt, this.sessionCloseNotes);
    this.storeService.setCurrentStore(storeLocationEnum.none);
    this.odooService.getPOSConfigIds();
    this.close();
  }
  close() {
    this.dialogRef.close();
  }

  endSessionStore() {
    //Call something here to say that the session is over?
    //Set selected location to none
    this.storeService.setCurrentStore(storeLocationEnum.none);
    this.odooService.getPOSConfigIds();
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
