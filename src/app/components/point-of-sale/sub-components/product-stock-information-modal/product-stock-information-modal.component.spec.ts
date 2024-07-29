import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductStockInformationModalComponent } from './product-stock-information-modal.component';

describe('ProductStockInformationModalComponent', () => {
  let component: ProductStockInformationModalComponent;
  let fixture: ComponentFixture<ProductStockInformationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductStockInformationModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductStockInformationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
