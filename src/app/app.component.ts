import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule, RouterOutlet } from "@angular/router";
import { State, userSelector } from "./ngrx/pos.reducer";
import { Store } from "@ngrx/store";
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
import {
  HttpClientModule,
  HttpClient,
  HttpHeaders,
} from "@angular/common/http";
import { CredentialResponse, PromptMomentNotification } from "google-one-tap";
import { WpApiModule, WpApiLoader, WpApiStaticLoader } from "wp-api-angular";
import { Http } from "@angular/http";
import { AnnouncementBoardComponent } from "./components/announcement-board/announcement-board.component";
import { WordPressService } from "./services/wordpress.service";
import { OdooService } from "./services/odoo.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    //RouterOutlet,
    CommonModule,
    //RouterModule,
    GoogleLogInComponent,
    ChooseLocationComponent,
    AnnouncementBoardComponent,
    HttpClientModule,
  ],

  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {
  title = "POSCustomStandalone";

  user: any = {};
  //userService:userService
  constructor(
    private http: HttpClient,
    private userService: userService,
    private wordpressService: WordPressService,
    storeService: storeService,
    //odooService: OdooService,
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
    //wordpressService.getAnnouncements();
  }
  ngOnInit(): void {
    this.wordpressService.getAnnouncements();
    // Subscribe the currentQuote property of quote service to get real time value
  }
}
