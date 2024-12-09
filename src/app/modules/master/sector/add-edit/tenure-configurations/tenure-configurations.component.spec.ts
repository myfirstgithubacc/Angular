import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenureConfigurationsComponent } from './tenure-configurations.component';

describe('TenureConfigurationsComponent', () => {
	let component: TenureConfigurationsComponent,
		fixture: ComponentFixture<TenureConfigurationsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TenureConfigurationsComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(TenureConfigurationsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
