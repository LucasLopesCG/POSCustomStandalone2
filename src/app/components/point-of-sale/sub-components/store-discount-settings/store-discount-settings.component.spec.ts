import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreDiscountSettingsComponent } from './store-discount-settings.component';

describe('StoreDiscountSettingsComponent', () => {
  let component: StoreDiscountSettingsComponent;
  let fixture: ComponentFixture<StoreDiscountSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreDiscountSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoreDiscountSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
