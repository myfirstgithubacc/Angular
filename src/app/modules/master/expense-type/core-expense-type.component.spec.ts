import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreExpenseTypeComponent } from './core-expense-type.component';

describe('CoreExpenseTypeComponent', () => {
	let component: CoreExpenseTypeComponent,
		fixture: ComponentFixture<CoreExpenseTypeComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [CoreExpenseTypeComponent]
		});
		fixture = TestBed.createComponent(CoreExpenseTypeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
