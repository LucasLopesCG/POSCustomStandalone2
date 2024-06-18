import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreReportModalComponent } from './store-report-modal.component';

describe('StoreReportModalComponent', () => {
  let component: StoreReportModalComponent;
  let fixture: ComponentFixture<StoreReportModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreReportModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoreReportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
