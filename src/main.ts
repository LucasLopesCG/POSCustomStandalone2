import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { provideStore } from "@ngrx/store";
import { stateReducer } from "./app/ngrx/pos.reducer";
import { userService } from "./app/services/userService";
import { storeService } from "./app/services/storeService";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideHttpClient } from "@angular/common/http";
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  providers: [
    userService,
    storeService,
    provideStore({ stateReducer: stateReducer }),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideAnimations()
],
}).catch((err) => console.error(err));

declare global {
  interface Window {
    onGoogleLibraryLoad: any;
  }
}
