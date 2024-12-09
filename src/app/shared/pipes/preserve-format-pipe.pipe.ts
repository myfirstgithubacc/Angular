import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
	name: 'preserveFormat'
})
export class PreserveFormatPipe implements PipeTransform {
	constructor(private sanitizer: DomSanitizer) {}

	transform(value: string): SafeHtml {
		if (!value) return value;

		let formatted = value.replace(/\n/g, '<br>');

		formatted = formatted.replace(/- (.*?)(<br>|$)/g, '• $1$2');

		return formatted;
	}
}
