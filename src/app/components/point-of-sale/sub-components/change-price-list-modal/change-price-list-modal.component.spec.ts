import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePriceListModalComponent } from './change-price-list-modal.component';

describe('ChangePriceListModalComponent', () => {
  let component: ChangePriceListModalComponent;
  let fixture: ComponentFixture<ChangePriceListModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangePriceListModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChangePriceListModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
