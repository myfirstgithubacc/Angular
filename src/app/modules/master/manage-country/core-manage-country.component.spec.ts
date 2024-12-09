import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoreManageCountryComponent } from './core-manage-country.component';


describe('CoreManageCountryComponent', () => {
  let component: CoreManageCountryComponent;
  let fixture: ComponentFixture<CoreManageCountryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoreManageCountryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreManageCountryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
