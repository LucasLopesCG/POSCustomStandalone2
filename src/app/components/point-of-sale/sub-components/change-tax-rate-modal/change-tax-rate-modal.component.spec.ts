import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeTaxRateModalComponent } from './change-tax-rate-modal.component';

describe('ChangeTaxRateModalComponent', () => {
  let component: ChangeTaxRateModalComponent;
  let fixture: ComponentFixture<ChangeTaxRateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeTaxRateModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChangeTaxRateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
