import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftConfigurationsComponent } from './shift-configurations.component';

describe('ShiftConfigurationsComponent', () => {
	let component: ShiftConfigurationsComponent,
		fixture: ComponentFixture<ShiftConfigurationsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ShiftConfigurationsComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(ShiftConfigurationsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
