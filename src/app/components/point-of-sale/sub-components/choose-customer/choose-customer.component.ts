import { Component, Inject } from "@angular/core";
import { customerService } from "../../../../services/customerService";
import { customer } from "../../../../models/customer";
import { MatIcon } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { OdooService } from "../../../../services/odoo.service";
@Component({
  selector: "app-choose-customer",
  standalone: true,
  imports: [FormsModule, CommonModule, MatIcon, MatFormField, MatLabel],
  templateUrl: "./choose-customer.component.html",
  styleUrl: "./choose-customer.component.css",
})
export class ChooseCustomerComponent {
  newCustomer: customer = { };
  displayMode: string = "all";
  showDetailsCustomer: customer = {};
  availableCustomers: Array<customer> = [];
  noDetails: boolean = true;
  constructor(
    private customerService: customerService,
    public dialogRef: MatDialogRef<ChooseCustomerComponent>,
    private odooService: OdooService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    customerService.availableCustomers$.subscribe((val) => {
      this.availableCustomers = val;
      // (this.availableCustomers);
    });
  }

  showCustomerDetail(event) {
    this.displayMode = "detail";
    // ("DISPLAY MORE DETAILS FOR THIS CUSTOMER:" +event);
    this.showDetailsCustomer = event;
    this.noDetails = false;
  }

  cancelShowCustomerDetail() {
    this.displayMode = "all";
    this.noDetails = true;
  }

  selectCustomer(event) {
    this.customerService.setCurrentCustomer(event);
    this.close();
  }

  createCustomer() {
    this.displayMode = "create";
    this.newCustomer = {
      name: "",
      email: "",
      phone: "",
      mobile: "",
      address: "",
      notes: [],
    };
  }
  saveCustomer() {
    //this.availableCustomers.push(structuredClone(this.newCustomer));
    this.customerService.addNewCustomer(this.newCustomer); //This service will be deleted? Maybe for just setting currentCustomer?
    this.odooService.submitNewCustomer(this.newCustomer);
    this.displayMode = "all";
    //console.log("SAVE ATTEMPTED");
  }

  close() {
    this.dialogRef.close();
  }
}
