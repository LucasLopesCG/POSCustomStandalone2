import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuruBucksModalComponent } from './guru-bucks-modal.component';

describe('GuruBucksModalComponent', () => {
  let component: GuruBucksModalComponent;
  let fixture: ComponentFixture<GuruBucksModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuruBucksModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GuruBucksModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
