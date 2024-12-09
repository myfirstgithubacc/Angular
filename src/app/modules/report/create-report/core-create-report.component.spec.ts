import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreCreateReportComponent } from './core-create-report.component';

describe('CoreCreateReportComponent', () => {
	let component: CoreCreateReportComponent;
	let fixture: ComponentFixture<CoreCreateReportComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [CoreCreateReportComponent]
		});
		fixture = TestBed.createComponent(CoreCreateReportComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
