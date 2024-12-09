import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingModelConfigurationsComponent } from './pricing-model-configurations.component';

describe('PricingModelConfigurationsComponent', () => {
	let component: PricingModelConfigurationsComponent,
		fixture: ComponentFixture<PricingModelConfigurationsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [PricingModelConfigurationsComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(PricingModelConfigurationsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
