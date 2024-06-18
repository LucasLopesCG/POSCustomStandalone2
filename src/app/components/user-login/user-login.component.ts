import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID,
} from "@angular/core";
import { User } from "../../models/user";
//import { UserLogIn } from '../../store/store-actions.actions';
import { userSelector, State } from "../../ngrx/pos.reducer";
import { select, Store } from "@ngrx/store";
import * as storeActions from "../../ngrx/pos.actions";
import { FormsModule } from "@angular/forms";
import { userService } from "../../services/userService";
import { storeLocationEnum } from "../../models/storeLocation";
import { accessLevel } from "../../models/accessLevel";
import { CredentialResponse, PromptMomentNotification } from "google-one-tap";
import { isPlatformBrowser } from "@angular/common";
declare var window: any;
declare var google: any;
@Component({
  selector: "app-user-login",
  templateUrl: "./user-login.component.html",
  styleUrl: "./user-login.component.css",
  standalone: true,
  imports: [FormsModule],
})
export class UserLoginComponent implements OnInit {
  userService: userService;
  element: ElementRef;
  constructor(
    userService: userService,
    @Inject(PLATFORM_ID) private platformId: Object,
    element: ElementRef,
  ) {
    this.element = element;
    this.userService = userService;
  }
  ngOnInit(): void {
    this.googleInitialize();
  }

  googleInitialize() {
    if (typeof google !== "undefined") {
      google.accounts.id.initialize({
        client_id: "YOUR_CLIENT_ID",
        callback: (response) => this.handleOauthResponse(response),
      });
      google.accounts.id.renderButton(
        this.element.nativeElement.querySelector("#g_id_onload"),
        { theme: "outline", size: "large" }, // customization attributes
      );
    } else {
      setTimeout(() => this.googleInitialize(), 100);
    }
  }

  username: string = "";
  password: string = "";
  curUser: User = {};
  loginUser() {
    // ("Attempting login of: " + this.username + " with the password value of: "+this.password);
    // ("NO LOGIC CURRENTLY IN PLACE TO DETERMINE IF USER CAN BE LOGGED IN. THIS IS JUST A POC");

    //Assume the store call to check if the user is an actual user is here.
    //Call will lead to an effect call that determines API result, firing off either the UserLogIn action or userLogInFailureAction, for now, just manually firing off
    //the login action
    //this.mockUserAPIService.retrieveUser(this.username,this.password);
    var testUser: User = { id: this.username };
    //this.store.dispatch(storeActions.setUser(testUser))
    var testUser: User = {};
    testUser.id = this.username;
    testUser.name = this.username;
    testUser.locationAccess = [
      { location: storeLocationEnum.Apopka, isRestaurant: false },
      { location: storeLocationEnum.DeLand, isRestaurant: true },
    ];
    testUser.accessLevel = accessLevel.SuperAdmin;

    this.userService.setCurrentUser(testUser);
    // (
    //  "dispatched? Should see appComponent consoleLog of user updating",
    //);
  }

  decodeJWTToken(token) {
    return JSON.parse(atob(token.split(".")[1]));
  }
  handleOauthResponse(response) {
    debugger;
    const responsePayload = this.decodeJWTToken(response.credential);
    console.log(responsePayload);
    sessionStorage.setItem("loggedinUser", JSON.stringify(responsePayload));
    //window.location('/your-desired-place')
    var potentialUser = JSON.stringify(responsePayload);
    debugger;
    //Changed the above URL where you want user to be redirected
    this.userService.setCurrentUser(JSON.stringify(responsePayload));
  }
}
