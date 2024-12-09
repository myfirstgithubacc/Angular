import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskDigits'
})
export class MaskDigitsPipe implements PipeTransform {

  transform(value: string, visibleDigits: number): string {
    if (value && value.length >0 && visibleDigits > 0 && visibleDigits < value.length) {
      const maskedDigits = value.length - visibleDigits;
      const mask = 'X'.repeat(maskedDigits);
      return mask + value.slice(-visibleDigits);
    } else {
      return value;
    }
  }

}
