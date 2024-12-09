import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoreJobCategoryComponent } from './core-job-category.component';

describe('CoreJobCategoryComponent', () => {
	let component: CoreJobCategoryComponent,
		fixture: ComponentFixture<CoreJobCategoryComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CoreJobCategoryComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(CoreJobCategoryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
