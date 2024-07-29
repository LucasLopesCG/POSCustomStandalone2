import { Component, OnInit } from "@angular/core";
import {
  GoogleLoginProvider,
  SocialAuthService,
  SocialAuthServiceConfig,
} from "@abacritt/angularx-social-login";
import { FormsModule } from "@angular/forms";
import { GoogleSigninButtonModule } from "@abacritt/angularx-social-login";
import { userService } from "../../services/userService";
import { storeLocationEnum } from "../../models/storeLocation";
import { accessLevel } from "../../models/accessLevel";
import { User } from "../../models/user";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-google-log-in",
  standalone: true,
  templateUrl: "./google-login.component.html",
  styleUrl: "./google-login.component.css",
  imports: [GoogleSigninButtonModule, FormsModule, CommonModule],
  providers: [
    {
      provide: "SocialAuthServiceConfig",
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              "857908989278-pi76j5ssnbllatmj931pd693dkmqijou.apps.googleusercontent.com",
            ),
          },
        ],
      } as SocialAuthServiceConfig,
    },
    SocialAuthService,
  ],
})
export class GoogleLogInComponent implements OnInit {
  notGuru: boolean = false;
  userService: userService;
  loginStatus: string = "";
  socialUser: any = {};
  isLoggedin: boolean = false;
  constructor(
    private socialAuthService: SocialAuthService,
    userService: userService,
  ) {
    this.userService = userService;
  }
  ngOnInit(): void {
    this.socialAuthService.authState.subscribe(
      (user) => {
        if (user.email.includes("@chronicguru.com")) {
          this.isLoggedin = user != null;
          this.socialUser = user;

          var testUser: User = {};
          testUser.id = user.id;
          testUser.name = user.name;
          testUser.email = user.email;
          //NEW SESSION!
          this.userService.setCurrentUser(testUser);
          this.userService.newSession();
        } else {
          this.socialAuthService.signOut();
          //Pass something here that shows user that they did not succeed in checking in!
          this.notGuru = true;
        }
      },
      (bad) => {},
    );
  }
  loginWithGoogle(): void {
    this.notGuru = false;
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }
  logoutWithGoogle(): void {
    this.isLoggedin = false;
    this.socialAuthService.signOut();
  }
}
