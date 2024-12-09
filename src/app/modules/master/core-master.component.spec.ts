import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreMasterComponent } from './core-master.component';

describe('CoreMasterComponent', () => {
  let component: CoreMasterComponent;
  let fixture: ComponentFixture<CoreMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoreMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
