import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BenefitAddConfigurationsComponent } from './benefit-add-configurations.component';

describe('BenefitAddConfigurationsComponent', () => {
	let component: BenefitAddConfigurationsComponent,
		fixture: ComponentFixture<BenefitAddConfigurationsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [BenefitAddConfigurationsComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(BenefitAddConfigurationsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
