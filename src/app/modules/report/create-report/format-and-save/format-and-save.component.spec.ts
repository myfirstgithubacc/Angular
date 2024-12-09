import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormatAndSaveComponent } from './format-and-save.component';

describe('FormatAndSaveComponent', () => {
	let component: FormatAndSaveComponent,
		fixture: ComponentFixture<FormatAndSaveComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [FormatAndSaveComponent]
		});
		fixture = TestBed.createComponent(FormatAndSaveComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
