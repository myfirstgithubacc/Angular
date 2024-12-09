import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreCostAccountingCodeComponent } from './core-cost-accounting-code.component';

describe('CoreCostAccountingCodeComponent', () => {
	let component: CoreCostAccountingCodeComponent,
		fixture: ComponentFixture<CoreCostAccountingCodeComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CoreCostAccountingCodeComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(CoreCostAccountingCodeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
