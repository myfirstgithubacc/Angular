export interface UserModel {
  UserCode: string;
  RoleName: string;
  RoleNo: number;
  RoleGroupId: number;
  UserNo: number;
  UserFirstName: string;
  UserMiddleName: string;
  UserLastName: string;
  UserFullName: string;
  StaffingAgencyId: number;
  AllowUserToRecieveEmailNotification: boolean;
  UserAlternatePhoneNumber: string;
  UserFaxNumber: string;
  UserAddressLine1: string;
  UserAddressLine2: string;
  UserCity: string;
  UserState: string;
  UserZipCode: string;
  CountryId: number;
  UserTitle: string;
  UserComments: string;
  UserApprovalLimit: number;
  UserRFxApprovalLimit: number;
  RepresentativeTypeId: number;
  StaffingRepresentativeId: number;
  UserDataAccessRight: string;
  IsAllSectorAccessible: boolean;
  UserStatus: number;
  SectorAccessList: [];
  ApprovalRolesList: [];
  UKey: string;
}

export class UserAdd{
  StaffingAgencyId: number=0;
  CountryId:number= 0;
  
  UserLastName:string= "";
  UserFirstName:string= "";
  UserMiddleName:string = "";
 
  UserLanguageId:number= 0;
  Email: string ="";

  PhoneNumber:string= "";

  UserAddressLine1:string= "";
  UserAddressLine2:string= "";

  UserCity:string= "";

  UserStateId:number= 0;
  UserZipCode:string= "";

  UserTimezoneId:number = 0;

  LoginMethod: string ="";

  UserName: string ="";
  RoleId: number =0;

  IsAllSectorAccessible:boolean= false;
  SectorAccessList: any =[];
  UserDataAccessRight:string= "";
  NextLevelManagerId:number =0;



  UserNo:Number= 0;
  UserStatus: number = 1;
  UserAlternatePhoneNumber: string ="";
  UserTitle:string= "";
  UserComments:string= "";
  ApprovalRolesList:any = [];
}


