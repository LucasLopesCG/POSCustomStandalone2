import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumeOrderModalComponent } from './resume-order-modal.component';

describe('ResumeOrderModalComponent', () => {
  let component: ResumeOrderModalComponent;
  let fixture: ComponentFixture<ResumeOrderModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumeOrderModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ResumeOrderModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
