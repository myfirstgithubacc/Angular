import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerClassificationComponent } from './core-worker-classification.component';

describe('WorkerClassificationComponent', () => {
	let component: WorkerClassificationComponent,
		fixture: ComponentFixture<WorkerClassificationComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [WorkerClassificationComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(WorkerClassificationComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
