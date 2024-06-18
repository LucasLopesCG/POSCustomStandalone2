import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseCustomerComponent } from './choose-customer.component';

describe('ChooseCustomerComponent', () => {
  let component: ChooseCustomerComponent;
  let fixture: ComponentFixture<ChooseCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseCustomerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChooseCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
