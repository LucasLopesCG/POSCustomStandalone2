import { Component, Inject } from "@angular/core";
import { customerService } from "../../../../services/customerService";
import { customer } from "../../../../models/customer";
import { MatIcon } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { OdooService } from "../../../../services/odoo.service";
import { WordPressService } from "../../../../services/wordpress.service";
@Component({
  selector: "app-choose-customer",
  standalone: true,
  imports: [FormsModule, CommonModule, MatIcon, MatFormField, MatLabel],
  templateUrl: "./choose-customer.component.html",
  styleUrl: "./choose-customer.component.css",
})
export class ChooseCustomerComponent {
  searchString: string = "";
  createCustomerMessage: string = "";
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
    private wordpressService: WordPressService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    customerService.availableCustomers$.subscribe((val) => {
      this.availableCustomers = val;
      this.maxPageCount = Math.round(this.availableCustomers.length / 50 - 1);
      this.maxPage = this.maxPageCount;

      this.filterCustomers();
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
    this.wordpressService.getGuruBucksForCustomer(event);
    this.close();
  }

  filterCustomers(): void {
    if (this.searchString != "")
      this.filteredCustomerList = this.availableCustomers;
    this.filteredCustomerList = this.availableCustomers.filter((customer) => {
      if (customer && customer.name) {
        const customerName = customer.name.toLowerCase();
        const customerAddress = (customer.address as string).toLowerCase();
        var email: any = customer.email;

        const customerEmail =
          email instanceof String ? email.toLowerCase() : "";
        const searchString = this.searchString.toLowerCase();
        return (
          customerAddress.includes(searchString) ||
          customerName.includes(searchString) ||
          customerEmail.includes(searchString)
        );
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
    this.createCustomerMessage = "";
    if (this.noRepeatData()) {
      this.customerService.addNewCustomer(this.newCustomer); //This service will be deleted? Maybe for just setting currentCustomer?
      this.odooService.submitNewCustomer(this.newCustomer);
      this.displayMode = "all";
    } else {
    }
    //this.availableCustomers.push(structuredClone(this.newCustomer));
  }

  noRepeatData(): boolean {
    var output: boolean = false;
    if (this.newCustomer.email == "") {
      this.createCustomerMessage = "An email is required";
      return false;
    }
    if (this.newCustomer.phone == "" && this.newCustomer.mobile == "") {
      this.createCustomerMessage = "A mobile or phone number is required";
      return false;
    }
    var findInstances = this.availableCustomers.filter((customer) => {
      if (customer) {
        var customerEmail = "";
        if (customer.email) {
          customerEmail = customer.email.toLowerCase() as string;
          if (customerEmail == this.newCustomer.email) {
            this.createCustomerMessage = "Email Already exists!";
            return true;
          }
        }
        var customerPhone = "";
        if (customer.phone) {
          customerPhone = customer.phone.toLowerCase() as string;
          if (
            customerPhone == this.newCustomer.phone ||
            customerPhone == this.newCustomer.mobile
          ) {
            this.createCustomerMessage =
              "Phone/Mobile already exists in system";
            return true;
          }
        }
        var customerMobile = "";
        if (customer.mobile) {
          customerMobile = customer.mobile.toLowerCase() as string;
          if (
            customerMobile == this.newCustomer.mobile ||
            customerMobile == this.newCustomer.phone
          ) {
            this.createCustomerMessage =
              "Phone/Mobile already exists in system";
            return true;
          }
        }
        return false;
      } else {
        //const searchString = this.searchString.toLowerCase();
        return false;
      }
    });
    if (findInstances.length > 0) {
      return false;
    }
    return true;
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
