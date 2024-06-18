import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashierSettingsModalComponent } from './cashier-settings-modal.component';

describe('CashierSettingsModalComponent', () => {
  let component: CashierSettingsModalComponent;
  let fixture: ComponentFixture<CashierSettingsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashierSettingsModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CashierSettingsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
