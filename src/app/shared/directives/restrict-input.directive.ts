/* eslint-disable @typescript-eslint/prefer-for-of */
import {
	Directive,
	HostListener,
	Input
} from '@angular/core';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
@Directive({
	selector: '[appRestrictInput]'
})
export class RestrictInputDirective {

  @Input() isSpecialCharacterAllowed: boolean = true;
  @Input() specialCharactersAllowed: string[] = [];
  @Input() specialCharactersNotAllowed: string[] = [];

  @Input() allowNumber: boolean;
  @Input() allowLetter: boolean;
  @Input() toUpperCase: boolean;
  @Input() formControl: any;
  public regex = /[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/u;
  private restrictWork = [
  	'script',
  	'.exe',
  	'execute',
  	'delete',
  	'sleep',
  	'delay'
  	/* 'select',
  	   'update',
  	   'union',
  	   'joined',
  	   'drop',
  	   'truncate',
  	   'alter',
  	   'create',
  	   'like',
  	   'order',
  	   'group',
  	   'waitfor',
  	   'having',
  	   'where', */
  ];
  private keyboardSpecialCharacters: string[] = [
  	'~', '!', '@', '#', '$', '%', '^', '&', '*',
  	'(', ')', '_', '+', '}', '{', '"', ':', '<',
  	'>', '?', '/', '.', ',', ';', '[', ']', '=', '-'
  ];

  constructor() {
  	this.keyboardSpecialCharacters.push("'");
  	this.keyboardSpecialCharacters.push("\\");
  }

  @HostListener('mouseover', ['$event']) onMouseOver(e: KeyboardEvent) {
  	this.controlFn(e);
  }

  @HostListener('mouseout', ['$event']) onMouseLeave(e: KeyboardEvent) {
  	this.controlFn(e);
  }

  @HostListener('input', ['$event']) onInputChange(e: Event) {
  	const input = e.target as HTMLInputElement;
	  if (this.toUpperCase) {
  		input.value = input.value.toUpperCase();
  	}
  	this.controlFn(e);
  }
  private controlFn(e: any) {
  	if (e.target.value == null) return;

  	let data = '',
  		val = e.target.value.toLowerCase();

  	for (const element of this.restrictWork) {
  		if (val.startsWith(element)) {
  			e.target.value = null;
  			return;
  		}

  		const modifiedElement = ` ${element}`;
  		if (val.endsWith(modifiedElement)) {
  			e.target.value = val.replace(modifiedElement, '');
  			return;
  		}

  		if (!val.endsWith(' ')) {
  			const modifiedElementSpace = ` ${element}`;
  			if (val.indexOf(modifiedElementSpace) > -1) {
  				e.target.value = val.replace(modifiedElementSpace, ' ');
  			}
  		}
  	}

  	val = e.target.value;
  	for (const char of val) {
  		const isValid = this.validateChar(char);
  		if (!isValid) continue;

  		data = data + char;
  	}

  	e.target.value = data;
  	if (this.formControl.value != data) {
  		this.formControl.setValue(data);
  	}
  }

  /*   private controlFn(e: any) {
       	if (e.target.value == null) return; */

  /*   	let data = '',
       		val = e.target.value.toLowerCase(); */

  /*   	    for (let element of this.restrictWork) {
       			if (val.startsWith(element)) {
       			e.target.value = null;
       			return;
       		} */

  /*   		// eslint-disable-next-line prefer-template
       		element = ` ${ element}`;
       		if (val.endsWith(element)) {
       			e.target.value = val.replace(element, '');
       			return;
       		} */

  /*   		if (!val.endsWith(' ')){
       			// eslint-disable-next-line prefer-template
       			element = ` ${ element}`;
       		} */


  /*   		if (val.indexOf(element) > -1){
       			e.target.value = val.replace(element, ' ');
       		} */

  //   	}


  /*   	val = e.target.value;
       	for (const element of val) {
       		const isValid = this.validateChar(element);
       		if (!isValid)
       			continue; */

  /*   		data = data + element;
       	} */

  /*   	e.target.value = data;
       	if (this.formControl.value != data) {
       		this.formControl.setValue(data);
       	}
       } */

  private validateChar(char: any) {

  	// check char is non keyboard symbol
  	// eslint-disable-next-line no-control-regex
  	if (char === '\x01' || char.match(/[^\x00-\x7F]/g) != null) return false;

  	// check char is alphnumeric
  	if (char.match(/[^a-zA-Z0-9 ]/g) == null) return true;

  	// check special character not allowed
  	if (!this.isSpecialCharacterAllowed && char.match(/[^a-zA-Z0-9 ]/g) != null) return false;

  	// allow all special chars
  	const isValid = this.specialCharactersAllowed.length == Number(magicNumber.zero) &&
                    this.specialCharactersNotAllowed.length == Number(magicNumber.zero);
  	if (isValid) return true;

  	// check that allowed or not
  	if (this.specialCharactersAllowed.length > Number(magicNumber.zero) &&
          this.specialCharactersAllowed.indexOf(char) < Number(magicNumber.zero))
  		return false;

  	// check that not allowed
  	if (this.specialCharactersNotAllowed.length > Number(magicNumber.zero) &&
          this.specialCharactersNotAllowed.indexOf(char) > Number(magicNumber.minusOne))
  		{
  		return false;
  	}

  	return true;
  }

}
