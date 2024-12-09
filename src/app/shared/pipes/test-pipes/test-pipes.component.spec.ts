import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestPipesComponent } from './test-pipes.component';

describe('TestPipesComponent', () => {
	let component: TestPipesComponent,
	 fixture: ComponentFixture<TestPipesComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TestPipesComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(TestPipesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
