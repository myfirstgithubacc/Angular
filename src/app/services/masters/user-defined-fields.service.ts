import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserDefinedFieldsService {

  constructor() { }



  getLabelText() {
    return this.getList()
      .filter(x => x.labelText != '')
      .map(x => { return { text: x.labelText, value: x.labelText }; });
  }



  getList() {
    return [
      {
        "ukey": "fda12502-35e8-419b-a703-088885e7c2a7",
        "fieldName": "CDF 1",
        "labelText": "Label 1",
        "fieldType": "Textbox",
        "mandatory": "True",
        "readOnly": "False",
        "visibleTo": "Client",
        "modificationBy": "Staffing",
        "Disabled": true,
      },
      {
        "ukey": "a075622c-cc95-4bbc-bfd2-2a799d0e7d83",
        "fieldName": "CDF 2",
        "labelText": "Label 2",
        "fieldType": "Multiline Textbox",
        "mandatory": "False",
        "readOnly": "True",
        "visibleTo": "Client",
        "modificationBy": "Staffing",
        "Disabled": false,
      },
      {
        "ukey": "11921c90-f90e-4c26-9046-0694f3cc9803",
        "fieldName": "CDF 3",
        "labelText": "Label 3",
        "fieldType": "Dropdown",
        "mandatory": "False",
        "readOnly": "True",
        "visibleTo": "Client",
        "modificationBy": "Staffing",
        "Disabled": false,
      },
      {
        "ukey": "95320aaf-3822-4dac-9825-96ac0bd90125",
        "fieldName": "CDF 4",
        "labelText": "Label 4",
        "fieldType": "Date",
        "mandatory": "False",
        "readOnly": "True",
        "visibleTo": "Client",
        "modificationBy": "Staffing",
        "Disabled": false,
      },
      {
        "ukey": "0db2c496-7168-4f4f-b682-910ecd1b5e5b",
        "fieldName": "CDF 5",
        "labelText": "Label 5",
        "fieldType": "Dropdown",
        "mandatory": "False",
        "readOnly": "True",
        "visibleTo": "Client",
        "modificationBy": "Staffing",
        "Disabled": false,
      },
      {
        "ukey": "2e569aac-020a-4e0a-a0ed-54184ba68b75",
        "fieldName": "CDF 6",
        "labelText": "Label 6",
        "fieldType": "Date",
        "mandatory": "False",
        "readOnly": "True",
        "visibleTo": "Client",
        "modificationBy": "Staffing",
        "Disabled": false,
      },
      {
        "ukey": "1c37e210-1a14-40d3-aed9-3142f3962ffc",
        "fieldName": "CDF 7",
        "labelText": "Label 7",
        "fieldType": "Textbox",
        "mandatory": "False",
        "readOnly": "True",
        "visibleTo": "Client",
        "modificationBy": "Staffing",
        "Disabled": false,
      },
      {
        "ukey": "fd92b9b9-351e-4797-8cd9-133489076f17",
        "fieldName": "CDF 8",
        "labelText": "Label 8",
        "fieldType": "Multiline Textbox",
        "mandatory": "False",
        "readOnly": "True",
        "visibleTo": "Client",
        "modificationBy": "Staffing",
        "Disabled": false,
      },
      {
        "ukey": "1e97af53-f746-4084-8466-fbd2b4cee2c0",
        "fieldName": "CDF 9",
        "labelText": "Label 9",
        "fieldType": "Dropdown",
        "mandatory": "False",
        "readOnly": "True",
        "visibleTo": "Client",
        "modificationBy": "Staffing",
        "Disabled": false,
      },
      {
        "ukey": "45e1d65f-683b-4181-a99c-55f917982133",
        "fieldName": "CDF 10",
        "labelText": "Label 10",
        "fieldType": "Date",
        "mandatory": "False",
        "readOnly": "True",
        "visibleTo": "Client",
        "modificationBy": "Staffing",
        "Disabled": false,
      }
    ];
  }

}
