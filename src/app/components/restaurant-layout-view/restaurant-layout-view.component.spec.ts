import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantLayoutViewComponent } from './restaurant-layout-view.component';

describe('RestaurantLayoutViewComponent', () => {
  let component: RestaurantLayoutViewComponent;
  let fixture: ComponentFixture<RestaurantLayoutViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantLayoutViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RestaurantLayoutViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
