import { Directive, HostListener } from '@angular/core';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';

@Directive({
	selector: '[appScrollOnTop]'
})
export class ScrollOnTopDirective {
  @HostListener('click', ['$event']) onKeypress(e: KeyboardEvent) {
		this.makeScreenScrollOnUpdate();
	}

  private makeScreenScrollOnUpdate() {
  	const fieldWithError = document.querySelector('.card__heading');
  	if (fieldWithError != null) {
  		setTimeout(() =>
  			fieldWithError?.scrollIntoView({ block: 'center' }), magicNumber.three);
  	}
  }

}
