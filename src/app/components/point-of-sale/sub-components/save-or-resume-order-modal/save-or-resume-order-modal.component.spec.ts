import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveOrResumeOrderModalComponent } from './save-or-resume-order-modal.component';

describe('SaveOrResumeOrderModalComponent', () => {
  let component: SaveOrResumeOrderModalComponent;
  let fixture: ComponentFixture<SaveOrResumeOrderModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaveOrResumeOrderModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SaveOrResumeOrderModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
