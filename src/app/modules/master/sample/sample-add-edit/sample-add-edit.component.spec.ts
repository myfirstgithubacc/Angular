import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleAddEditComponent } from './sample-add-edit.component';

describe('SampleAddEditComponent', () => {
  let component: SampleAddEditComponent;
  let fixture: ComponentFixture<SampleAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SampleAddEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SampleAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
