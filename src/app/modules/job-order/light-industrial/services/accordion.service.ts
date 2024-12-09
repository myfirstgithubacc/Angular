import { ElementRef, Injectable } from '@angular/core';
import { SectionElementRefs, SectionNames, SectionVisibility } from '../constant/accordion.interface';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Injectable({
	providedIn: 'root'
})
export class AccordionService {

	public toggleSectionVisibility(
		sectionVisibility: SectionVisibility,
		section: SectionNames
	): void {
		const sectionKey = `show${section.charAt(magicNumber.zero).toUpperCase() + section.slice(magicNumber.one)}Section` as keyof SectionVisibility;
		sectionVisibility[sectionKey] = !sectionVisibility[sectionKey];
	}

	public getCardClass(
		sectionElementRefs: SectionElementRefs,
		section: SectionNames
	): string {
		return this.isSectionInvalidAndTouched(sectionElementRefs, section)
			? 'card--error'
			: '';
	}

	private isSectionInvalidAndTouched(
		sectionElementRefs: SectionElementRefs,
		section: SectionNames
	): boolean {
		const sectionElement = sectionElementRefs[`${section}Section`] as ElementRef | undefined,
			invalidTouchedElements = sectionElement?.nativeElement?.querySelectorAll('.ng-invalid.ng-touched');
		return invalidTouchedElements?.length > magicNumber.zero || false;
	}


	public isSectionContainInvalidControls(
		sectionElementRefs: SectionElementRefs,
		sectionVisibility: SectionVisibility,
		section: SectionNames
	): boolean {
		const sectionElement = sectionElementRefs[`${section}Section`]?.nativeElement,
			hasInvalidControl = Boolean(sectionElement?.querySelector('.ng-invalid')),
			sectionKey = `show${section.charAt(magicNumber.zero).toUpperCase() + section.slice(magicNumber.one)}Section` as keyof SectionVisibility;
		if (hasInvalidControl) {
			sectionVisibility[sectionKey] = hasInvalidControl;
		}
		return hasInvalidControl;
	}

}
