import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApproverService {

  constructor() { 
    console.log('ApproverService')
  }

  getDropDownList() {
    return [
      {Text : 'Aggarwal, Ash', Value : '1'},
      {Text : 'Chaurasia, Nikhil', Value : '2'},
      {Text : 'Rao, RV', Value : '3'},
      {Text : 'Shah, Beena', Value : '4'}
    ];
  }
}
