import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { WordPressService } from "../../services/wordpress.service";
import { accessLevel } from "../../models/accessLevel";
@Component({
  selector: "app-cashier-settings-modal",
  standalone: true,
  imports: [MatIcon, FormsModule, CommonModule],
  templateUrl: "./cashier-settings-modal.component.html",
  styleUrl: "./cashier-settings-modal.component.css",
})
export class CashierSettingsModalComponent {
  currentEditUser: any = {};
  public accessLevel = accessLevel;
  newUserObject: any = {};
  userList: Array<any> = [];
  displayMode: string = "Display";
  constructor(
    public dialogRef: MatDialogRef<CashierSettingsModalComponent>,
    private wordpressService: WordPressService,
  ) {
    wordpressService.wordpressUserList$.subscribe((val) => {
      this.userList = val;
    });
  }

  determineAccessLevel(val: any) {
    if (val == 0 || val == 1) {
      return "ADMIN";
    }
    if (val == 2) {
      return "Manager";
    }
    if (val == 3) {
      return "Cashier";
    }
    return "none";
  }

  startUserEdit(user: any) {
    //set mode to "edit"
    //make a copy of the currently selected user.
    //set currently selected user
    this.displayMode = "edit";
    this.currentEditUser = structuredClone(user);
  }

  deleteUserConfirmation(user: any) {
    this.displayMode = "delete";
    this.currentEditUser = structuredClone(user);
  }
  deleteUser(user:any){
    this.displayMode='Display';
    this.wordpressService.deleteUser(user);
  }

  newUser() {
    this.newUserObject = { email: "", access_level: "", stores: "" };
    this.displayMode = "new";
    //set mode to "new"
  }

  createUser() {
    this.wordpressService.addNewUser(this.newUserObject);
    this.displayMode = "Display";
  }

  cancelEditMode() {
    this.displayMode = "Display";
  }
  editUser() {
    this.wordpressService.updateUser(this.currentEditUser);
    this.displayMode = "Display";
    //call wordpressService to save the updated User.
  }

  cancelNewMode() {
    this.displayMode = "Display";
  }

  close() {
    this.dialogRef.close();
  }
}
