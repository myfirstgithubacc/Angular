import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnauthorizedRecordPageComponent } from './unauthorized-record-page.component';

describe('UnauthorizedRecordPageComponent', () => {
  let component: UnauthorizedRecordPageComponent;
  let fixture: ComponentFixture<UnauthorizedRecordPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnauthorizedRecordPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UnauthorizedRecordPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
