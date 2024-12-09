import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmittalConfigurationsComponent } from './submittal-configurations.component';

describe('SubmittalConfigurationsComponent', () => {
	let component: SubmittalConfigurationsComponent,
		fixture: ComponentFixture<SubmittalConfigurationsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [SubmittalConfigurationsComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(SubmittalConfigurationsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
