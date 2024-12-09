/* eslint-disable one-var */
/* eslint-disable no-prototype-builtins */
/* eslint-disable line-comment-position */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
import { Pipe, PipeTransform } from '@angular/core';
import { map, Observable } from 'rxjs';
import { EmailTemplateService } from 'src/app/services/masters/email-template.service';

@Pipe({
	name: 'emailjson'
})
export class EmailjsonPipe implements PipeTransform {
	constructor(private emailTemplateService: EmailTemplateService) { }
	 transform(key: string): any {
	   	return this.emailTemplateService.getJsonData().pipe(map((emailData:any) => {
	   		if (!emailData || !key) {
	   			return key;
	   		}

	   		for (const value in emailData) {
	   			if (Object.prototype.hasOwnProperty.call(emailData, value)) {
	   				const placeholder = `"${value}"`,
	   					keyForValue = emailData[value],
	   					regex = new RegExp(placeholder, 'g');
	   				key = key.replace(regex, keyForValue !== undefined
	   					? keyForValue
	   					: placeholder);
	   			}
	   		}
			return key;
	   	}));
	   }


}
