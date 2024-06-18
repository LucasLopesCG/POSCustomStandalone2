import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantLayoutEditComponent } from './restaurant-layout-edit.component';

describe('RestaurantLayoutEditComponent', () => {
  let component: RestaurantLayoutEditComponent;
  let fixture: ComponentFixture<RestaurantLayoutEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantLayoutEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RestaurantLayoutEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
