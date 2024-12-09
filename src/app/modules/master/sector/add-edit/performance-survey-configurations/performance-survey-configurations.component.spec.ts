import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceSurveyConfigurationsComponent } from './performance-survey-configurations.component';

describe('PerformanceSurveyConfigurationsComponent', () => {
	let component: PerformanceSurveyConfigurationsComponent,
		fixture: ComponentFixture<PerformanceSurveyConfigurationsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [PerformanceSurveyConfigurationsComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(PerformanceSurveyConfigurationsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
