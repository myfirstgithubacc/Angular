import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonAssignmentListComponent } from './list.component';

describe('ListComponent', () => {
  let component: CommonAssignmentListComponent;
  let fixture: ComponentFixture<CommonAssignmentListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommonAssignmentListComponent]
    });
    fixture = TestBed.createComponent(CommonAssignmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
