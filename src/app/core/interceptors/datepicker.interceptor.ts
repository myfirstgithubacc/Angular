import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DatePickerService } from '@xrm-shared/widgets/form-controls/kendo-datepicker/datepicker.service';

@Injectable()
export class DatePickerInterceptor implements HttpInterceptor {

  constructor(private datePickerService: DatePickerService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const clonedRequest = req.clone({
      body: this.processPayload(req.body)
    });

    return next.handle(clonedRequest);
  }

  private processPayload(payload: any): any {
    if (payload && typeof payload === 'object') {
      const dateFields = this.datePickerService.getDatePickerFields();
      const fieldMappings = this.datePickerService.getFieldMappings();
 
      for (const key of dateFields) {
        const payloadKey = fieldMappings[key] || key;
        if (payload.hasOwnProperty(payloadKey)) {
          const date = this.datePickerService.parseDateString(payload[payloadKey]);
          payload[payloadKey] = this.datePickerService.formatDateWithoutTime(date);
        }
      }
    }
    return payload;
  }

}

