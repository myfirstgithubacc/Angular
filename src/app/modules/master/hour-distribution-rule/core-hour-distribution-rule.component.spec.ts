import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreHourDistributionRuleModuleComponent } from './core-hour-distribution-rule.component';

describe('CoreHourAdjustmentComponent', () => {
	let component: CoreHourDistributionRuleModuleComponent,
		fixture: ComponentFixture<CoreHourDistributionRuleModuleComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [CoreHourDistributionRuleModuleComponent]
		});
		fixture = TestBed.createComponent(CoreHourDistributionRuleModuleComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
