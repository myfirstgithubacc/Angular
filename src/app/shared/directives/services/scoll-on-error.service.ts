import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class ScrollOnErrorService {

	private readonly magicNumber = {
		hundred: 100
	};

	makeScreenScrollOnError(): void {
		const fieldWithError: NodeListOf<Element> | null = document.querySelectorAll('.ng-invalid'),
			error = this.findIndex(fieldWithError);

		if (error != null) {
			setTimeout(() => {
				error.scrollIntoView({ block: 'center' });
			}, this.magicNumber.hundred);
			error.focus();
		}
	}

	private findIndex(fieldWithError: NodeListOf<Element>): HTMLElement | null {
		let index = 0;
		for (let i = 0; i < fieldWithError.length; i++) {
			if (fieldWithError[i].localName !== 'form' && fieldWithError[i].localName !== 'div' && fieldWithError[i].localName !== 'tr') {
				index = i;
				break;
			}
		}
		return fieldWithError[index].querySelector('.k-input-inner') as HTMLElement | null;
	}
}
