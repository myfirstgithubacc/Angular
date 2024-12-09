import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicdetailsComponent } from './basicdetails.component';

describe('BasicdetailsComponent', () => {
  let component: BasicdetailsComponent;
  let fixture: ComponentFixture<BasicdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BasicdetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
