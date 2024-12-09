import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequisitionConfigurationsComponent } from './requisition-configurations.component';

describe('RequisitionConfigurationsComponent', () => {
	let component: RequisitionConfigurationsComponent,
		fixture: ComponentFixture<RequisitionConfigurationsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [RequisitionConfigurationsComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(RequisitionConfigurationsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
