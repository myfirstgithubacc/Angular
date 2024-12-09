import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreConfigureClientComponent } from './core-configure-client.component';

describe('CoreConfigureClientComponent', () => {
  let component: CoreConfigureClientComponent;
  let fixture: ComponentFixture<CoreConfigureClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoreConfigureClientComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreConfigureClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
