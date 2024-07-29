import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitOrderModalComponent } from './split-order-modal.component';

describe('SplitOrderModalComponent', () => {
  let component: SplitOrderModalComponent;
  let fixture: ComponentFixture<SplitOrderModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplitOrderModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SplitOrderModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
