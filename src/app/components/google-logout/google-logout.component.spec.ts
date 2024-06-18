import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleLogoutComponent } from './google-logout.component';

describe('GoogleLogoutComponent', () => {
  let component: GoogleLogoutComponent;
  let fixture: ComponentFixture<GoogleLogoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoogleLogoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GoogleLogoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
