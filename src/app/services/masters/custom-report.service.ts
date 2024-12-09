import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class CustomReportService {



  public saveJobCategory = new BehaviorSubject<any>(false);
  public isInactive = new BehaviorSubject<any>(false);

  public _saveJobCategory = this.saveJobCategory.asObservable();

  constructor() { }


  getDropDownList() {
    return [
      { Text: 'Pitney Bowes Inc.', Value: 'Pitney Bowes Inc.' },

    ];
  }
  liRequestId() {
    return [
      { Text: 'LIREQ00000336', Value: 'LIREQ00000336' },
      { Text: 'PRRQ00000337', Value: 'PRRQ00000337' },
      { Text: 'LIREQ00000338', Value: 'LIREQ00000338' },
      { Text: 'PRRQ00000339', Value: 'PRRQ00000339' },
      { Text: 'LIREQ00000340', Value: 'LIREQ00000340' },
      { Text: 'PRRQ00000341', Value: 'PRRQ00000341' },
    ];
  }
  liRequesttype() {
    return [
      { Text: 'LI', Value: 'LI' },
      { Text: 'Professional', Value: 'Professional' },
    ];
  }
  reasonForRequest() {
    return [
      { Text: 'HR', Value: '6' },
      { Text: 'Open Position(s)', Value: '7' },
    ];
  }
  LaborCategory(){
    return[
      {Text: 'Machine Operator' , Value:'11'},
      {Text: 'Assembly Technician' , Value:'12'},
      {Text: 'Quality Inspector' , Value:'13'},
      {Text: 'Forklift Operator' , Value:'14'},
      {Text: 'Production Worker' , Value:'15'},

    ]
  }

  email() {
    return [
      { Text: '	none@acrocorp.com ', Value: '	none@acrocorp.com' },

    ];
  }

  contacatNumber() {
    return [
      { Text: '(746) 547 1023 Ext 0179 ', Value: '(746) 547 1023 Ext 0179' },

    ];
  }

  userName() {
    return [
      { Text: 'Smith, John', Value: '8' },
      { Text: 'Jack, Rayan', Value: '9' },
    ];
  }

  userId() {
    return [
      { Text: 'USRS000001', Value: 'USRS000001' },
      { Text: 'USRS000002', Value: 'USRS000002' },
      { Text: 'USRS000003', Value: 'USRS000003' },
      { Text: 'USRS000004', Value: 'USRS000004' },
      { Text: 'USRS000005', Value: 'USRS000005' },
      { Text: 'USRS000006', Value: 'USRS000006' },
    ];
  }

  userType() {
    return [
      { Text: 'Client User', Value: '10' },
      { Text: 'MSP User', Value: '11' },
      { Text: 'Staffing Agency User', Value: '12' },
    ];
  }

  Status(){
    return[
      {Text: 'Approved',Value:'16'},
      {Text: 'Open',Value:'17'},
    ]
  }

  role(){
    return[
      {Text: 'Accounting Manager',Value:'20'},
      {Text: 'HR User',Value:'21'},
    ]
  }

  country(){
    return[
      {Text: 'USA', Value:'24'},
      {Text: 'UK', Value:'25'},
      {Text: 'Canada', Value:'26'}
    ]
  }

  language(){
    return[
      {Text: 'English-USA', Value:'28'},
      {Text: 'English-UK', Value:'29'},
      {Text: 'Canada', Value:'30'}
    ]
  }

  Sector(){
    return[
      {Text: 'Taylor Corporation' , Value:'18'},
      {Text: 'Taylor Communications' , Value:'19'},
    ]
  }

  orgLevel1(){
    return[
      {Text: 'Inspection Department' ,Value:'21'},
      {Text: 'Warehouse Operations' ,Value:'22'},
      {Text: 'Production' ,Value:'23'},
    ]
  }

  workLocation(){
    return[
      {Text: 'Texas' , Value: '24'},
    ]
  }

  ContractorName(){
    return[
      {Text: 'Page, Larry' , Value: '25'},
      {Text: 'Smith, Zane' , Value: '26'},
      {Text: 'Smith, Tom' , Value: '27'},
      {Text: 'Doe, John' , Value: '28'},
    ]
  }

  ContractorType(){
    return[
      {Text: 'LI' , Value: 'LI'},
      {Text: 'Professional' , Value: 'Professional'},
    ]
  }
  UID(){
    return[
      {Text: '756345856' , Value: '29'},
      {Text: '756345857' , Value: '30'},
      {Text: '756345858' , Value: '31'},
      {Text: '756345859' , Value: '32'},
    ]
  }
  ContractorID(){
    return[
      {Text: 'CONT32100001' , Value: '33'},
      {Text: 'CONT32100002' , Value: '34'},
      {Text: 'CONT32100003' , Value: '35'},
      {Text: 'CONT32100004' , Value: '36'},
    ]
  }

  AssignmentID(){
    return[
      {Text: 'ASGNT-205784' , Value: '37'},
      {Text: 'ASGNT-205785' , Value: '38'},
      {Text: 'ASGNT-205786' , Value: '39'},
      {Text: 'ASGNT-205787' , Value: '40'},
    ]
  }
  StatusContractor(){
    return[
      {Text: 'Non Working' , Value: '41'},
      {Text: 'Scheduled' , Value: '42'},

    ]
  }

  StaffingAgency(){
    return[
      {Text: 'Davis Staffing, Inc.' , Value: '43'},
    ]
  }

  JobCategoryType() {
    return [
      { Text: 'Clerk Entry Level', Value: 'Clerk Entry Level' },
      { Text: 'Auto CAD Coordinator', Value: 'Auto CAD Coordinator' },
      { Text: 'Account Manager', Value: 'Account Manager' },
      { Text: 'Data Entry Operator', Value: 'Data Entry Operator' },
      { Text: 'Customer Service Representative', Value: 'Customer Service Representative' },
    ];
  }


  clientJobCode() {
    return [
      { Text: '01', Value: '01' },
      { Text: '02', Value: '02' },
      { Text: '03', Value: '03' },
      { Text: '04', Value: '04' },
      { Text: '05', Value: '05' },
      { Text: '06', Value: '06' },
      { Text: '07', Value: '07' },
    ];
  }
  overtimeHoursBilledAt() {
    return [
      { Text: 'Straight Time (Exempt)', Value: 'Straight Time (Exempt)' },
      { Text: 'Overtime (Non Exempt)', Value: 'Overtime (Non Exempt)' },
    ];
  }
  allowWageRateAdjustments() {
    return [
      { Text: 'Yes', Value: 'Yes' },
      { Text: 'No', Value: 'No' },
    ];
  }


  CandidateId(){
    return[
      {Text: 'CAND0001' , Value: 'CAND0001'},
      {Text: 'CAND0002' , Value: 'CAND0002'},
      {Text: 'CAND0003' , Value: 'CAND0003'},
      {Text: 'CAND0004' , Value: 'CAND0004'},
      {Text: 'CAND0005' , Value: 'CAND0005'},
      {Text: 'CAND0006' , Value: 'CAND0006'},
    ]
  }

  contactNumber(){
    return[
      {Text: '(212) 342 4345 Ext 12346' , Value: '(212) 342 4345 Ext 12346'},
      {Text: '(342) 543 1231 Ext 23123' , Value: '(342) 543 1231 Ext 23123'},
      {Text: '(231) 442 3422 Ext 54231' , Value: '(231) 442 3422 Ext 54231'},
      {Text: '(121) 876 2321 Ext 12563' , Value: '(121) 876 2321 Ext 12563'},
      {Text: '(543) 321 3423 Ext 12334' , Value: '(543) 321 3423 Ext 12334'},
      {Text: '(222) 111 1221 Ext 56321' , Value: '(222) 111 1221 Ext 56321'},
    ]
  }

  emailAddress(){
    return[
      {Text: 'none@acrocorp.com' , Value: 'none@acrocorp.com'},
    ]
  }

  statusCandidate(){
    return[
      {Text: 'Pending Selection' , Value: 'Pending Selection'},
    ]
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
  assignmentStatus() {
    return [
      { Text: 'Alexus', Value: 'Alexus' },
      { Text: 'Braylon', Value: 'Braylon' },
      { Text: 'Draven', Value: 'Draven' },
      { Text: 'Jamarion', Value: 'Jamarion' },
      { Text: 'Jaxson', Value: 'Jaxson' },
    ];
  }

  CategoryList() {
    return [
      { Text: 'Administration', Value: 'Administration' },
      { Text: 'Candidate', Value: 'Candidate' },
      { Text: 'Contractor', Value: 'Contractor' },
      { Text: 'Requisition', Value: 'Requisition' },
      { Text: 'Time & Expense', Value: 'Time & Expense' },
    ];
  }
  reportNameList() {
    return [
      { Text: 'Approval Configuration', Value: 'Approval Configuration' },
      { Text: 'Cost Accounting Code', Value: 'Cost Accounting Code' },
      { Text: 'Configure Client', Value: 'Configure Client' },
      { Text: 'Job Category', Value: 'Job Category' },
      { Text: 'Labor Category', Value: 'Labor Category' },
    ];
  }

  getReportList() {
    return [
      {
        "ukey": "fda12502-35e8-419b-a703-088885e7c2a7",
        "liRequest":"LIRQ00000336",
        "reasonForRequest":"Open Position(s)",
        "laborCategory":"Production Worker",
        "jobCategory": "Warehouse",
        "requestType": "LI",
        "status": "Open",
        "businessUnit": "Taylor Corporation",
        "orgLevel1": "Inspection Department",
        "contractorWorkLocation": "Texas",
        "shift": "Monroe, NJ 2nd Shift (2.00)",
        "requestManager": "Victoria, Kelly",
        "orglevel2": "Finance - Audit",
        "orglevel3": "Information Technology",
        "orglevel4": "Global Customer OPS",
        "createdBy":"Jaxson",
        "createdOn": "09/28/2016 06:33",
        "modifiedBy":"Alexus",
        "updatedOn": "09/28/2016 06:33",
        "active": true,
      }
    ];
  }

  getList() {
    return [
      {
        "ukey": "fda12502-35e8-419b-a703-088885e7c2a7",
        "liRequest":"CRBR00000334",
        "reportName":"CLP Name Report",
        "laborCategory":"Production Worker",
        "jobCategory": "Warehouse",
        "requestType": "LI",
        "repordDiscription": "Get the details of all CLP created today by LI / PSR / Requisition modules.",
        "status": "Open",
        "businessUnit": "Taylor Corporation",
        "orgLevel1": "Inspection Department",
        "contractorWorkLocation": "Texas",
        "shift": "Monroe, NJ 2nd Shift (2.00)",
        "requestManager": "Victoria, Kelly",
        "orglevel2": "Finance - Audit",
        "orglevel3": "Information Technology",
        "orglevel4": "Global Customer OPS",
        "createdBy":"Jaxson",
        "createdOn": "09/28/2016 06:33",
        "modifiedBy":"Alexus",
        "updatedOn": "19/12/2016",
        "active": true,
      },
      {
        "ukey": "fda12502-35e8-419b-a703-088885e7c2a8",
        "liRequest":"CRBR00000337",
        "reportName":"Requisition Broadcast Report",
        "reasonForRequest":"HR",
        "laborCategory":"Production Worker",
        "jobCategory": "Warehouse",
        "status": "Open",
        "requestType": "Professional",
        "repordDiscription": "Get the details of Requisition Broadcast Report created today by Professional Requisition modules.",
        "businessUnit": "Taylor Corporation",
        "orgLevel1": "Warehouse Operations",
        "contractorWorkLocation": "Texas",
        "shift": "Seasonal Day (1.00)",
        "requestManager": "Victoria, Kelly",
        "orglevel2": "CEO Office",
        "orglevel3": "Information Technology",
        "orglevel4": "Global Customer OPS",
        "createdBy":"Jamarion",
        "createdOn": "09/28/2016 06:33",
        "modifiedBy":"Braylon",
        "updatedOn": "19/12/2016",
        "active": true,
      },
      {
        "ukey": "fda12502-35e8-419b-a703-088885e7c2a9",
        "liRequest":"CRBR00000338",
        "reportName":"Active CLP Details",
        "reasonForRequest":"Open Position(s)",
        "laborCategory":"Forklift Operator",
        "jobCategory": "Inspection",
        "status": "Approved",
        "requestType": "LI",
        "repordDiscription": "Get the details of all CLP created today by LI / PSR / Requisition modules.",
        "businessUnit": "Taylor Communications",
        "orgLevel1": "Inspection Department",
        "contractorWorkLocation": "Texas",
        "shift": "Monroe, NJ 2nd Shift (2.00)",
        "requestManager": "Even, Peters",
        "orglevel2": "CORPORATE",
        "orglevel3": "Human Resource",
        "orglevel4": "Human Resource",
        "createdBy":"Draven",
        "createdOn": "09/28/2016 06:33",
        "modifiedBy":"Draven",
        "updatedOn": "19/12/2016",
        "active": false,
      },
      {
        "ukey": "fda12502-35e8-419b-a703-088885e7c2a6",
        "liRequest":"CRBR00000339",
        "reportName":"Report",
        "reasonForRequest":"HR",
        "laborCategory":"Quality Inspector",
        "jobCategory": "Warehouse",
        "status": "Approved",
        "requestType": "Professional",
        "repordDiscription": "Get the details of all CLP created today by LI / PSR / Requisition modules.",
        "businessUnit": "Taylor Corporation",
        "orgLevel1": "Production",
        "contractorWorkLocation": "Texas",
        "shift": "Standard",
        "requestManager": "Victoria, Kelly",
        "orglevel2": "Finance - Audit",
        "orglevel3": "Information Technology",
        "orglevel4": "Global Customer OPS",
        "createdBy":"Jaxson",
        "createdOn": "09/28/2016 06:33",
        "modifiedBy":"Alexus",
        "updatedOn": "19/12/2016",
        "active": false,
      },
      {
        "ukey": "fda12502-35e8-419b-sa703-088885e7c2a5",
        "liRequest":"CRBR00000340",
        "reportName":"Rate History Report- Standard Report",
        "reasonForRequest":"Open Position(s)",
        "laborCategory":"Machine Operator",
        "jobCategory": "Inspection",
        "status": "Open",
        "requestType": "LI",
        "repordDiscription": "Get the details of Rate History Report by LI Requisition modules.",
        "businessUnit": "Taylor Communications",
        "orgLevel1": "Warehouse Operations",
        "contractorWorkLocation": "Texas",
        "shift": "Seasonal Day (1.00)",
        "requestManager": "Even, Peters",
        "orglevel2": "CEO Office",
        "orglevel3": "Global Customer OPS",
        "orglevel4": "Human Resource",
        "createdBy":"Jamarion",
        "createdOn": "09/28/2016 06:33",
        "modifiedBy":"Braylon",
        "updatedOn": "19/12/2016",
        "Frequency": "Monthly",
        "Scheduledon": "05/07/2024 13:00",
        "OutputFormat":"PDF",
        "Shared":"Shared by me",
        "active": false,
      },
      {
        "ukey": "fda12502-35e8-419b-a703-088885e7c2a9",
        "liRequest":"CRBR00000338",
        "reportName":"Active CLP Details",
        "reasonForRequest":"Open Position(s)",
        "laborCategory":"Forklift Operator",
        "jobCategory": "Inspection",
        "status": "Approved",
        "requestType": "LI",
        "repordDiscription": "Get the details of all CLP created today by LI / PSR / Requisition modules.",
        "businessUnit": "Taylor Communications",
        "orgLevel1": "Inspection Department",
        "contractorWorkLocation": "Texas",
        "shift": "Monroe, NJ 2nd Shift (2.00)",
        "requestManager": "Even, Peters",
        "orglevel2": "CORPORATE",
        "orglevel3": "Human Resource",
        "orglevel4": "Human Resource",
        "createdBy":"Draven",
        "createdOn": "09/28/2016 06:33",
        "modifiedBy":"Draven",
        "updatedOn": "19/12/2016",
        "active": false,
      },
      {
        "ukey": "fda12502-35e8-419b-a703-088885e7c2a6",
        "liRequest":"CRBR00000339",
        "reportName":"Report",
        "reasonForRequest":"HR",
        "laborCategory":"Quality Inspector",
        "jobCategory": "Warehouse",
        "status": "Approved",
        "requestType": "Professional",
        "repordDiscription": "Get the details of all CLP created today by LI / PSR / Requisition modules.",
        "businessUnit": "Taylor Corporation",
        "orgLevel1": "Production",
        "contractorWorkLocation": "Texas",
        "shift": "Standard",
        "requestManager": "Victoria, Kelly",
        "orglevel2": "Finance - Audit",
        "orglevel3": "Information Technology",
        "orglevel4": "Global Customer OPS",
        "createdBy":"Jaxson",
        "createdOn": "09/28/2016 06:33",
        "modifiedBy":"Alexus",
        "updatedOn": "19/12/2016",
        "active": false,
      },
      {
        "ukey": "fda12502-35e8-419b-sa703-088885e7c2a5",
        "liRequest":"CRBR00000340",
        "reportName":"Rate History Report- Standard Report",
        "reasonForRequest":"Open Position(s)",
        "laborCategory":"Machine Operator",
        "jobCategory": "Inspection",
        "status": "Open",
        "requestType": "LI",
        "repordDiscription": "Get the details of Rate History Report by LI Requisition modules.",
        "businessUnit": "Taylor Communications",
        "orgLevel1": "Warehouse Operations",
        "contractorWorkLocation": "Texas",
        "shift": "Seasonal Day (1.00)",
        "requestManager": "Even, Peters",
        "orglevel2": "CEO Office",
        "orglevel3": "Global Customer OPS",
        "orglevel4": "Human Resource",
        "createdBy":"Jamarion",
        "createdOn": "09/28/2016 06:33",
        "modifiedBy":"Braylon",
        "updatedOn": "19/12/2016",
        "Frequency": "Monthly",
        "Scheduledon": "05/07/2024 13:00",
        "OutputFormat":"PDF",
        "Shared":"Shared by me",
        "active": true,
      },
      {
        "ukey": "fda12502-35e8-419b-sa703-088885e7c2a5",
        "liRequest":"CRBR00000340",
        "reportName":"Rate History Report- Standard Report",
        "reasonForRequest":"Open Position(s)",
        "laborCategory":"Machine Operator",
        "jobCategory": "Inspection",
        "status": "Open",
        "requestType": "LI",
        "repordDiscription": "Get the details of Rate History Report by LI Requisition modules.",
        "businessUnit": "Taylor Communications",
        "orgLevel1": "Warehouse Operations",
        "contractorWorkLocation": "Texas",
        "shift": "Seasonal Day (1.00)",
        "requestManager": "Even, Peters",
        "orglevel2": "CEO Office",
        "orglevel3": "Global Customer OPS",
        "orglevel4": "Human Resource",
        "createdBy":"Jamarion",
        "createdOn": "09/28/2016 06:33",
        "modifiedBy":"Braylon",
        "updatedOn": "19/12/2016",
        "Frequency": "Monthly",
        "Scheduledon": "05/07/2024 13:00",
        "OutputFormat":"PDF",
        "Shared":"Shared by me",
        "active": true,
      },
      {
        "ukey": "fda12502-35e8-419b-sa703-088885e7c2a5",
        "liRequest":"CRBR00000340",
        "reportName":"Rate History Report- Standard Report",
        "reasonForRequest":"Open Position(s)",
        "laborCategory":"Machine Operator",
        "jobCategory": "Inspection",
        "status": "Open",
        "requestType": "LI",
        "repordDiscription": "Get the details of Rate History Report by LI Requisition modules.",
        "businessUnit": "Taylor Communications",
        "orgLevel1": "Warehouse Operations",
        "contractorWorkLocation": "Texas",
        "shift": "Seasonal Day (1.00)",
        "requestManager": "Even, Peters",
        "orglevel2": "CEO Office",
        "orglevel3": "Global Customer OPS",
        "orglevel4": "Human Resource",
        "createdBy":"Jamarion",
        "createdOn": "09/28/2016 06:33",
        "modifiedBy":"Braylon",
        "updatedOn": "19/12/2016",
        "Frequency": "Monthly",
        "Scheduledon": "05/07/2024 13:00",
        "OutputFormat":"PDF",
        "Shared":"Shared by me",
        "active": true,
      }

    ];
  }
}
