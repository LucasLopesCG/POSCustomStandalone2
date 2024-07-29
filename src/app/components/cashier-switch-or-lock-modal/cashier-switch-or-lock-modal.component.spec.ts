import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashierSwitchOrLockModalComponent } from './cashier-switch-or-lock-modal.component';

describe('CashierSwitchOrLockModalComponent', () => {
  let component: CashierSwitchOrLockModalComponent;
  let fixture: ComponentFixture<CashierSwitchOrLockModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashierSwitchOrLockModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CashierSwitchOrLockModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
