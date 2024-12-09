import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { GenericService } from 'src/app/shared/services/generic.service';

@Injectable({
  providedIn: 'root'
})
export class LocationService extends GenericService{

  constructor(
    private http: HttpClient
  ) { 
    super(http);
  }
  getLocationBySectorId(sectorId:any){
    return this.Get<ApiResponse>('/Location/GetLocationDropdownBySector?sectorId', sectorId);
  }

  getAdvanceSearchFields() {

    return [
      {
        control: 'multidd',
        list: [
          { Text: 'CDF 1', Value: '1' },
          { Text: 'CDF 2', Value: '2' },
          { Text: 'CDF 3', Value: '3' },
          { Text: 'CDF 4', Value: '4' },
          { Text: 'CDF 5', Value: '5' },
          { Text: 'CDF 6', Value: '6' },
          { Text: 'CDF 7', Value: '7' },
          { Text: 'CDF 8', Value: '8' },
        ],
        controlName: 'sector',
        label: 'Sector',
      },
      {
        control: 'multidd',
        list: [
          { Text: 'Textbox', Value: '1' },
          { Text: 'Multiline Textbox', Value: '2' },
          { Text: 'Dropdown', Value: '3' },
          { Text: 'Date', Value: '4' }
        ],
        controlName: 'fieldType',
        label: 'Field Type',
      },
      {
        control: 'multidd',
        list: [
          { Text: 'Client', Value: '1' },
          { Text: 'Staffing', Value: '2' },
          { Text: 'CLP', Value: '3' },
          { Text: 'MSP', Value: '4' }
        ],
        controlName: 'visibleTo',
        label: 'Visible To',
      },
      {
        control: 'multidd',
        list: [
          { Text: 'Client', Value: '1' },
          { Text: 'Staffing', Value: '2' },
          { Text: 'CLP', Value: '3' },
          { Text: 'MSP', Value: '4' }
        ],
        controlName: 'modificationBy',
        label: 'Modification By',
      }
    ];
  }

  getDropDownList() {
    return [
      // {
      //   Text: 'All',
      //   Value: 'All',
      // },
      {
        Text: 'Yes',
        Value: 'Yes',
      },
      {
        Text: 'No',
        Value: 'No',
      },
    ];
  }

  stateRulesList() {
    return [
      { Text: 'OH', Value: 'OH' },
      { Text: 'FL', Value: 'FL' },
      { Text: 'NY', Value: 'NY' },
      { Text: 'PA', Value: 'PA' },
      { Text: 'NM', Value: 'NM' },
    ];
  }

  locationId() {
    return [
      { Text: 'LOC-0001', Value: 'LOC-0001' },
      { Text: 'LOC-0002', Value: 'LOC-0002' },
      { Text: 'LOC-0003', Value: 'LOC-0003' },
      { Text: 'LOC-0004', Value: 'LOC-0004' },
      { Text: 'LOC-0005', Value: 'LOC-0005' },
    ];
  }


  createdByList() {
    return [
      { Text: 'Alexus', Value: 'Alexus' },
      { Text: 'Braylon', Value: 'Braylon' },
      { Text: 'Draven', Value: 'Draven' },
      { Text: 'Jamarion', Value: 'Jamarion' },
      { Text: 'Jaxson', Value: 'Jaxson' },
    ];
  }


  getList() {
    return [
      {
        "ukey": "fda12502-35e8-419b-a703-088885e7c2a7s",
        "Sector": "MF - Allyn WA (1068)",
        "locationName": "Clarion, PA",
        "locationId": 1,
        "utilizeLI": "",
        "city": "Clarion",
        "state": "PA",
        "salesTaxRequired": "",
        "stateSalesTaxRate": "",
        "timeZone": "",
        "addressLine1": "Noida",
        "addressLine2": "Noida",
        "zipcode": "",
        "country": "",
        "mileageRate": "",
        "shiftVaryByLocation": "",
        "enterInOutAcroTrac": "",
        "useDailyOT": "",
        "otStateRules": "",
        "regSTHours": "",
        "timeImportAllowed": "",
        "supplierMarkupsUniqueToLocation": "",
        "locationCode": "",
        "active": true,
        "createdBy": "lsingh",
        "createdOn": "02/05/23",
        "updatedBy": "lSingh",
        "updatedOn": "03/05/23"
      },
      {
        "ukey": "fda12502-35e8-419b-a703-08888524c2a7s",
        "Sector": "MF - Allyn WA (1068)",
        "locationName": "GB Remote",
        "locationId": 1,
        "utilizeLI": "",
        "city": "Remote",
        "state": "OH",
        "salesTaxRequired": "",
        "stateSalesTaxRate": "",
        "timeZone": "",
        "addressLine1": "Noida",
        "addressLine2": "Noida",
        "zipcode": "",
        "country": "",
        "mileageRate": "",
        "shiftVaryByLocation": "",
        "enterInOutAcroTrac": "",
        "useDailyOT": "",
        "otStateRules": "",
        "regSTHours": "",
        "timeImportAllowed": "",
        "supplierMarkupsUniqueToLocation": "",
        "locationCode": "",
        "active": true,
        "createdBy": "lsingh",
        "createdOn": "02/05/23",
        "updatedBy": "lSingh",
        "updatedOn": "03/05/23"
      },
      {
        "ukey": "fda12502-35e8-419b-a703-08888567c2a7s",
        "Sector": "MF - Allyn WA (1068)",
        "locationName": "PBI - Akron",
        "locationId": 1,
        "utilizeLI": "",
        "city": "Akron",
        "state": "OH",
        "salesTaxRequired": "",
        "stateSalesTaxRate": "",
        "timeZone": "",
        "addressLine1": "Noida",
        "addressLine2": "Noida",
        "zipcode": "",
        "country": "",
        "mileageRate": "",
        "shiftVaryByLocation": "",
        "enterInOutAcroTrac": "",
        "useDailyOT": "",
        "otStateRules": "",
        "regSTHours": "",
        "timeImportAllowed": "",
        "supplierMarkupsUniqueToLocation": "",
        "locationCode": "",
        "active": true,
        "createdBy": "lsingh",
        "createdOn": "02/05/23",
        "updatedBy": "lSingh",
        "updatedOn": "03/05/23"
      },
      {
        "ukey": "fda12502-35e8-419b-a703-08888127c2a7s",
        "Sector": "MF - Allyn WA (1068)",
        "locationName": "PBI - Albany",
        "locationId": 1,
        "utilizeLI": "",
        "city": "Albany",
        "state": "NY",
        "salesTaxRequired": "",
        "stateSalesTaxRate": "",
        "timeZone": "",
        "addressLine1": "Noida",
        "addressLine2": "Noida",
        "zipcode": "",
        "country": "",
        "mileageRate": "",
        "shiftVaryByLocation": "",
        "enterInOutAcroTrac": "",
        "useDailyOT": "",
        "otStateRules": "",
        "regSTHours": "",
        "timeImportAllowed": "",
        "supplierMarkupsUniqueToLocation": "",
        "locationCode": "",
        "active": true,
        "createdBy": "lsingh",
        "createdOn": "02/05/23",
        "updatedBy": "lSingh",
        "updatedOn": "03/05/23"
      },
      {
        "ukey": "fda128092-35e8-419b-a703-088885e7c2a7s",
        "Sector": "MF - Allyn WA (1068)",
        "locationName": "PBI - Albuquerque",
        "locationId": 1,
        "utilizeLI": "",
        "city": "Albuquerque",
        "state": "NM",
        "salesTaxRequired": "",
        "stateSalesTaxRate": "",
        "timeZone": "",
        "addressLine1": "Noida",
        "addressLine2": "Noida",
        "zipcode": "",
        "country": "",
        "mileageRate": "",
        "shiftVaryByLocation": "",
        "enterInOutAcroTrac": "",
        "useDailyOT": "",
        "otStateRules": "",
        "regSTHours": "",
        "timeImportAllowed": "",
        "supplierMarkupsUniqueToLocation": "",
        "locationCode": "",
        "active": true,
        "createdBy": "lsingh",
        "createdOn": "02/05/23",
        "updatedBy": "lSingh",
        "updatedOn": "03/05/23"
      },
      {
        "ukey": "fda12502-35e8-2419b-a703-088885e7c2a7s",
        "Sector": "MF - Allyn WA (1068)",
        "locationName": "	PBI - Allentown",
        "locationId": 1,
        "utilizeLI": "",
        "city": "Allentown",
        "state": "PA",
        "salesTaxRequired": "",
        "stateSalesTaxRate": "",
        "timeZone": "",
        "addressLine1": "Noida",
        "addressLine2": "Noida",
        "zipcode": "",
        "country": "",
        "mileageRate": "",
        "shiftVaryByLocation": "",
        "enterInOutAcroTrac": "",
        "useDailyOT": "",
        "otStateRules": "",
        "regSTHours": "",
        "timeImportAllowed": "",
        "supplierMarkupsUniqueToLocation": "",
        "locationCode": "",
        "active": true,
        "createdBy": "lsingh",
        "createdOn": "02/05/23",
        "updatedBy": "lSingh",
        "updatedOn": "03/05/23"
      },
      {
        "ukey": "fda12502-35e8-349b-a703-088885e7c2a7s",
        "Sector": "MF - Allyn WA (1068)",
        "locationName": "	PBI - Altamonte Springs FL",
        "locationId": 1,
        "utilizeLI": "",
        "city": "Alpharetta",
        "state": "GA",
        "salesTaxRequired": "",
        "stateSalesTaxRate": "",
        "timeZone": "",
        "addressLine1": "Noida",
        "addressLine2": "Noida",
        "zipcode": "",
        "country": "",
        "mileageRate": "",
        "shiftVaryByLocation": "",
        "enterInOutAcroTrac": "",
        "useDailyOT": "",
        "otStateRules": "",
        "regSTHours": "",
        "timeImportAllowed": "",
        "supplierMarkupsUniqueToLocation": "",
        "locationCode": "",
        "active": true,
        "createdBy": "lsingh",
        "createdOn": "02/05/23",
        "updatedBy": "lSingh",
        "updatedOn": "03/05/23"
      },
      {
        "ukey": "fda12502-35e8-419b-a703-088885e7c2a46",
        "Sector": "MF - Allyn WA (1068)",
        "locationName": "PBI - Amherst",
        "locationId": 1,
        "utilizeLI": "",
        "city": "Altamonte",
        "state": "FL",
        "salesTaxRequired": "",
        "stateSalesTaxRate": "",
        "timeZone": "",
        "addressLine1": "Noida",
        "addressLine2": "Noida",
        "zipcode": "",
        "country": "",
        "mileageRate": "",
        "shiftVaryByLocation": "",
        "enterInOutAcroTrac": "",
        "useDailyOT": "",
        "otStateRules": "",
        "regSTHours": "",
        "timeImportAllowed": "",
        "supplierMarkupsUniqueToLocation": "",
        "locationCode": "",
        "active": true,
        "createdBy": "lsingh",
        "createdOn": "02/05/23",
        "updatedBy": "lSingh",
        "updatedOn": "03/05/23"
      },
      {
        "ukey": "fda12502-35e8-419b-a703-088885e7c2a09",
        "Sector": "MF - Allyn WA (1068)",
        "locationName": "PBI - Alpharetta",
        "locationId": 1,
        "utilizeLI": "",
        "city": "Amherst",
        "state": "NY",
        "salesTaxRequired": "",
        "stateSalesTaxRate": "",
        "timeZone": "",
        "addressLine1": "Noida",
        "addressLine2": "Noida",
        "zipcode": "",
        "country": "",
        "mileageRate": "",
        "shiftVaryByLocation": "",
        "enterInOutAcroTrac": "",
        "useDailyOT": "",
        "otStateRules": "",
        "regSTHours": "",
        "timeImportAllowed": "",
        "supplierMarkupsUniqueToLocation": "",
        "locationCode": "",
        "active": false,
        "createdBy": "lsingh",
        "createdOn": "02/05/23",
        "updatedBy": "lSingh",
        "updatedOn": "03/05/23"
      },
      {
        "ukey": "fda12502-35e8-419b-a703-088885e7c2a87",
        "Sector": "MF - Allyn WA (1068)",
        "locationName": "PBI - Amherst",
        "locationId": 1,
        "utilizeLI": "",
        "city": "Altamonte",
        "state": "FL",
        "salesTaxRequired": "",
        "stateSalesTaxRate": "",
        "timeZone": "",
        "addressLine1": "Noida",
        "addressLine2": "Noida",
        "zipcode": "",
        "country": "",
        "mileageRate": "",
        "shiftVaryByLocation": "",
        "enterInOutAcroTrac": "",
        "useDailyOT": "",
        "otStateRules": "",
        "regSTHours": "",
        "timeImportAllowed": "",
        "supplierMarkupsUniqueToLocation": "",
        "locationCode": "",
        "active": false,
        "createdBy": "lsingh",
        "createdOn": "02/05/23",
        "updatedBy": "lSingh",
        "updatedOn": "03/05/23"
      }
    ];
  }
} 
