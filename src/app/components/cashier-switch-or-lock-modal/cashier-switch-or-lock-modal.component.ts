import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { userService } from "../../services/userService";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import {
  GoogleLoginProvider,
  GoogleSigninButtonModule,
  SocialAuthService,
  SocialAuthServiceConfig,
} from "@abacritt/angularx-social-login";
import { User } from "../../models/user";

@Component({
  selector: "app-cashier-switch-or-lock-modal",
  standalone: true,
  imports: [MatIcon, FormsModule, CommonModule, GoogleSigninButtonModule],
  templateUrl: "./cashier-switch-or-lock-modal.component.html",
  styleUrl: "./cashier-switch-or-lock-modal.component.css",
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
export class CashierSwitchOrLockModalComponent {
  isLockMode: boolean = false;
  user: any = {};
  notGuru: boolean = false;
  constructor(
    public dialogRef: MatDialogRef<CashierSwitchOrLockModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private socialAuthService: SocialAuthService,
    private userService: userService,
  ) {
    this.isLockMode = data;
    if (this.isLockMode) {
      dialogRef.disableClose = true;
    }
    userService.dataUser$.subscribe((val) => {
      this.user = val;
    });
  }

  ngOnInit(): void {
    this.socialAuthService.authState.subscribe(
      (user) => {
        if (this.isLockMode) {
          if (user.email != this.user.email) {
            this.notGuru = true;
          }
        } else {
          if (user.email.includes("@chronicguru.com")) {
            //this.isLoggedin = user != null;
            //this.socialUser = user;

            var testUser: User = {};
            testUser.id = user.id;
            testUser.name = user.name;
            testUser.email = user.email;
            //NEW SESSION!
            this.userService.setCurrentUser(testUser);
            //this.userService.newSession();
            this.close();
          } else {
            this.socialAuthService.signOut();
            //Pass something here that shows user that they did not succeed in checking in!
            this.notGuru = true;
          }
        }
      },
      (bad) => {},
    );
  }
  loginWithGoogle(): void {
    this.notGuru = false;
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  close() {
    this.dialogRef.close();
  }
}
