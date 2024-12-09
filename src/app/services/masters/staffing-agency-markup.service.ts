import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StaffingAgencyMarkupService {


  getStaffingAgencyDropDownList() {
    
    
    
    
    return [
      {
        Text: 'Acro',
        Value: 'Acro',
      },
      {
        Text: 'A2Z Global Staffing',
        Value: 'A2Z Global Staffing',
      },
      {
        Text: 'Advantage Resourcing',
        Value: 'Advantage Resourcing',
      },
      {
        Text: 'Acro Service Corporation',
        Value: 'Acro Service Corporation',
      },
      {
        Text: 'AIG Staffing Solutions',
        Value: 'AIG Staffing Solutions',
      },
    ];
  }

  getSectorDropDownList() {
    return [
      {
        Text: "Skyline",
        Value: "Skyline",
      },
      {
        Text: "Onguard",
        Value: "Onguard",
      },
      {
        Text: "BDNET",
        Value: "BDNET",
      },
      {
        Text: "Pristine",
        Value: "Pristine",
      },
      {
        Text: "Honey Well",
        Value: "Honey Well",
      },
    ];
  }

  getStaffingAgencyTypeList(){
    return [ 
      
      {
        Text: 'Preferred',
        Value: 'Preferred',
      },
      {
        Text: 'Tier 2',
        Value: 'Tier 2',
      },
      {
        Text: 'Other',
        Value: 'Other',
      },
    ];
  }

  getLaborCategoryDropDownList() {
    return [
      {
        Text: 'Backfill (PB Presort Services Inc)',
        Value: 'Backfill (PB Presort Services Inc)	',
      },
      {
        Text: 'Backfill (Pitney Bowes - GEC)	',
        Value: 'Backfill (Pitney Bowes - GEC)	',
      },
      {
        Text: 'Open Position(s) (PB Presort Services Inc)	',
        Value: 'Open Position(s) (PB Presort Services Inc)	',
      },
    ];
  }

  getLocationDropDownList() {
    return [
      {
        Text: 'Backfill (PB Presort Services Inc)',
        Value: 'Backfill (PB Presort Services Inc)	',
      },
      {
        Text: 'Backfill (Pitney Bowes - GEC)	',
        Value: 'Backfill (Pitney Bowes - GEC)	',
      },
      {
        Text: 'Open Position(s) (PB Presort Services Inc)	',
        Value: 'Open Position(s) (PB Presort Services Inc)	',
      },
    ];
  }
}

