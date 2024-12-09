import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreGlobalSearchComponent } from './core-global-search.component';

describe('CoreGlobalSearchComponent', () => {
  let component: CoreGlobalSearchComponent;
  let fixture: ComponentFixture<CoreGlobalSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoreGlobalSearchComponent]
    });
    fixture = TestBed.createComponent(CoreGlobalSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
