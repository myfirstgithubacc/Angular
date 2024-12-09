import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreCandidatePoolComponent } from './core-candidate-pool.component';

describe('CoreCandidatePoolComponent', () => {
	let component: CoreCandidatePoolComponent,
		fixture: ComponentFixture<CoreCandidatePoolComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CoreCandidatePoolComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(CoreCandidatePoolComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
