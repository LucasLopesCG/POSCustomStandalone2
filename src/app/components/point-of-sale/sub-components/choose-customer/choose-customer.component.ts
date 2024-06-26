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
  searchString: string = "";
  page: number = 0;
  maxPage: number = 1;
  maxPageCount: number = 1;
  newCustomer: customer = {};
  displayMode: string = "all";
  showDetailsCustomer: customer = {};
  availableCustomers: Array<customer> = [];
  filteredCustomerList: Array<customer> = [];
  noDetails: boolean = true;
  constructor(
    private customerService: customerService,
    public dialogRef: MatDialogRef<ChooseCustomerComponent>,
    private odooService: OdooService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    customerService.availableCustomers$.subscribe((val) => {
      this.availableCustomers = val;
      this.maxPageCount = Math.round(this.availableCustomers.length / 50 - 1);
      this.maxPage = this.maxPageCount;

      this.filterProducts();
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

  filterProducts(): void {
    if (this.searchString != "")
      this.filteredCustomerList = this.availableCustomers;
    this.filteredCustomerList = this.availableCustomers.filter((customer) => {
      if (customer && customer.name) {
        const customerName = customer.name.toLowerCase();
        const searchString = this.searchString.toLowerCase();
        return customerName.includes(searchString);
      } else {
        //const searchString = this.searchString.toLowerCase();
        return false;
      }
    });
    this.maxPage = Math.round(this.filteredCustomerList.length / 50 - 1);
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

  goToPage(i: number) {
    this.page = i;
  }

  beforePage() {
    return this.page * 50;
  }
  afterPage() {
    return this.page * 50 + 50;
  }

  close() {
    this.dialogRef.close();
  }
}
