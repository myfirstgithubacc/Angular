import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreExpenseEntryComponent } from './core-expense-entry.component';

describe('CoreExpenseComponent', () => {
	let component: CoreExpenseEntryComponent,
		fixture: ComponentFixture<CoreExpenseEntryComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [CoreExpenseEntryComponent]
		});
		fixture = TestBed.createComponent(CoreExpenseEntryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
