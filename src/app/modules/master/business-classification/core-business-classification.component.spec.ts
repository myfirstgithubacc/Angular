import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreBusinessClassificationComponent } from './core-business-classification.component';

describe('CoreBusinessClassificationComponent', () => {
	let component: CoreBusinessClassificationComponent,
		fixture: ComponentFixture<CoreBusinessClassificationComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CoreBusinessClassificationComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(CoreBusinessClassificationComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
