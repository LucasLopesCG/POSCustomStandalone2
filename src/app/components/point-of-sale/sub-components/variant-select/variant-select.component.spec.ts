import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantSelectComponent } from './variant-select.component';

describe('VariantSelectComponent', () => {
  let component: VariantSelectComponent;
  let fixture: ComponentFixture<VariantSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariantSelectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VariantSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
