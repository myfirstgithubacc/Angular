import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocompleteDropdownComponent } from './autocomplete-dropdown.component';

describe('AutocompleteDropdownComponent', () => {
	let component: AutocompleteDropdownComponent,
		fixture: ComponentFixture<AutocompleteDropdownComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [AutocompleteDropdownComponent]
		});
		fixture = TestBed.createComponent(AutocompleteDropdownComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
