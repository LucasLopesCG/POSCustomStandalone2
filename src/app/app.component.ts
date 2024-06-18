import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule, RouterOutlet } from "@angular/router";
import { State, userSelector } from "./ngrx/pos.reducer";
import { Store } from "@ngrx/store";
import { UserLoginComponent } from "./components/user-login/user-login.component";
import { Subscription } from "rxjs";
import { User } from "./models/user";
import { userService } from "./services/userService";
import { ChooseLocationComponent } from "./components/choose-location/choose-location.component";
import { storeService } from "./services/storeService";
import { GoogleLogInComponent } from "./components/google-login/google-login.component";
import {
  GoogleLoginProvider,
  SocialAuthService,
  SocialAuthServiceConfig,
} from "@abacritt/angularx-social-login";
import { CredentialResponse, PromptMomentNotification } from "google-one-tap";
import { WpApiModule, WpApiLoader, WpApiStaticLoader } from "wp-api-angular";
import { Http } from "@angular/http";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    //RouterOutlet,
    CommonModule,
    //RouterModule,
    UserLoginComponent,
    GoogleLogInComponent,
    ChooseLocationComponent,
  ],

  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {
  title = "POSCustomStandalone";

  user: any = {};
  //userService:userService
  constructor(
    private userService: userService,
    storeService: storeService,
  ) {
    // userService.userSubject.asObservable().subscribe((content)=>{
    //   this.user=content
    //    ("value of user updated?")
    //    (this.user);
    // })
    userService.dataUser$.subscribe((val) => {
      this.user = val;
      // ("USER VALUE UPDATED!!");
      // (this.user);
      storeService.setAvailableStore(this.user.locationAccess);
    });
  }
  ngOnInit(): void {
    // Subscribe the currentQuote property of quote service to get real time value
  }
}
