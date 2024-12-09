import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargeNumberConfigurationsComponent } from './charge-number-configurations.component';

describe('ChargeNumberConfigurationsComponent', () => {
	let component: ChargeNumberConfigurationsComponent,
		fixture: ComponentFixture<ChargeNumberConfigurationsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ChargeNumberConfigurationsComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(ChargeNumberConfigurationsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
