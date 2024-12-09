import { Directive, ElementRef, HostListener} from '@angular/core';
@Directive({
	selector: '[appNoSpace]'
})
export class NoSpaceDirective {

	// @Input() formControl: AbstractControl<any, any> | null;

	constructor(private el: ElementRef) {}

	getControl(): any {
  	return this.el.nativeElement;
	}

  @HostListener('input', ['$event']) onInput(event: InputEvent): void {
  	const inputElement = event.target as HTMLInputElement,
  		value = inputElement.value;
  	inputElement.value = value.replace(/\s/g, '');
  	this.getControl().value = value.replace(/\s/g, '');
	}

}
