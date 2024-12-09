import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproverOtherDetailsComponent } from './approver-other-details.component';

describe('ApproverOtherDetailsComponent', () => {
  let component: ApproverOtherDetailsComponent;
  let fixture: ComponentFixture<ApproverOtherDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproverOtherDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ApproverOtherDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
