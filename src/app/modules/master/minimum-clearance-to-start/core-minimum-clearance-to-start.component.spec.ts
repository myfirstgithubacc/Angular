import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreMinimumClearanceToStartComponent } from './core-minimum-clearance-to-start.component';

describe('CoreSecurityClearanceLevelComponent', () => {
	let component: CoreMinimumClearanceToStartComponent,
	 fixture: ComponentFixture<CoreMinimumClearanceToStartComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CoreMinimumClearanceToStartComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(CoreMinimumClearanceToStartComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
