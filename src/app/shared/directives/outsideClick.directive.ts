import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
	selector: '[appOutsideClick]'
})
export class OutsideClickDirective {
	constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('document:click', ['$event.target'])
	onClick(targetElement: any) {
		// Check if the click occurred outside the TimePicker element
		if (!this.el.nativeElement.contains(targetElement)) {
			// Close the TimePicker (you might need to import Kendo TimePicker if not already imported)
			this.renderer.setProperty(this.el.nativeElement, 'value', null);
		}
	}
}
