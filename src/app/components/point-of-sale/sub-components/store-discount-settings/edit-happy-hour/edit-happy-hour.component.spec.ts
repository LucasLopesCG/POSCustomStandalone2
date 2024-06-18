import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditHappyHourComponent } from './edit-happy-hour.component';

describe('EditHappyHourComponent', () => {
  let component: EditHappyHourComponent;
  let fixture: ComponentFixture<EditHappyHourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditHappyHourComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditHappyHourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
