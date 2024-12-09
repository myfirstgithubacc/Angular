import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoreActrotracComponent } from './core-acrotrac.component';

describe('CoreActrotracComponent', () => {
	let component: CoreActrotracComponent,
		fixture: ComponentFixture<CoreActrotracComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CoreActrotracComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(CoreActrotracComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
