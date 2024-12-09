import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractorAddEditComponent } from './contractor-add-edit.component';

describe('ContractorAddEditComponent', () => {
  let component: ContractorAddEditComponent;
  let fixture: ComponentFixture<ContractorAddEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContractorAddEditComponent]
    });
    fixture = TestBed.createComponent(ContractorAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
