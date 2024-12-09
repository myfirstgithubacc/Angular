import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatesAndFeesConfigurationsComponent } from './rates-and-fees-configurations.component';

describe('RatesAndFeesConfigurationsComponent', () => {
	let component: RatesAndFeesConfigurationsComponent,
		fixture: ComponentFixture<RatesAndFeesConfigurationsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [RatesAndFeesConfigurationsComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(RatesAndFeesConfigurationsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
