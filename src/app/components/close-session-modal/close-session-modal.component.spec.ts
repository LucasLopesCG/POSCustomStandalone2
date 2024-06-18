import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseSessionModalComponent } from './close-session-modal.component';

describe('CloseSessionModalComponent', () => {
  let component: CloseSessionModalComponent;
  let fixture: ComponentFixture<CloseSessionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloseSessionModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CloseSessionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
