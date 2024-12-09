import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreUserDefinedFieldPickListComponent } from './core-user-defined-field-pick-list.component';

describe('CoreUserDefinedFieldPickListComponent', () => {
	let component: CoreUserDefinedFieldPickListComponent,
		fixture: ComponentFixture<CoreUserDefinedFieldPickListComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CoreUserDefinedFieldPickListComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(CoreUserDefinedFieldPickListComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
