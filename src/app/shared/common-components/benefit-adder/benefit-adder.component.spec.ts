import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BenefitAdderComponent } from './benefit-adder.component';

describe('BenefitAdderComponent', () => {
	let component: BenefitAdderComponent,
	 fixture: ComponentFixture<BenefitAdderComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [BenefitAdderComponent]
		});
		fixture = TestBed.createComponent(BenefitAdderComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
