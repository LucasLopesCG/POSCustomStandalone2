import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseCouponComponent } from './choose-coupon.component';

describe('ChooseCouponComponent', () => {
  let component: ChooseCouponComponent;
  let fixture: ComponentFixture<ChooseCouponComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseCouponComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChooseCouponComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
