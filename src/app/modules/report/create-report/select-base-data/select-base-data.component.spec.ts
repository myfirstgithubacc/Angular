import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectBaseDataComponent } from './select-base-data.component';

describe('SelectBaseDataComponent', () => {
  let component: SelectBaseDataComponent;
  let fixture: ComponentFixture<SelectBaseDataComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelectBaseDataComponent]
    });
    fixture = TestBed.createComponent(SelectBaseDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
