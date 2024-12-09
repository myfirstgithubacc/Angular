import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeViewReadonlyComponent } from './tree-view-readonly.component';

describe('TreeViewReadonlyComponent', () => {
  let component: TreeViewReadonlyComponent;
  let fixture: ComponentFixture<TreeViewReadonlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreeViewReadonlyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeViewReadonlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
