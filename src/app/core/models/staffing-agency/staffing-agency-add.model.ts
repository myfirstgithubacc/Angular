import { IPreparedUdfPayloadData } from '@xrm-shared/common-components/udf-implementation/Interface/udf-common.model';
import { ToJson } from '../responseTypes/to-json.model';

type UKeyType = string | undefined | null;
type UKeyType1 = number | undefined | null;
type UKeyType2 = boolean | undefined | null;


export class StaffingAgency extends ToJson {
	primaryPhoneExtension:string;
	paymentTypeId:number;
	contactPrimaryUserList:string | number;
	contactAlternateUserList:string | number;
	contactAcountingUserList:string | number;
	comments:string;
	alternatePhoneExtension:string;
	accountingPhoneExtension:string;
	ChangePrimaryUser:string;
	ChangeAlternateUser:string;
	ChangeAccountingUser:string;
	UKey: UKeyType;
	countryId: UKeyType1;
	staffingAgencyEin: UKeyType;
	staffingAgencyNumber: UKeyType;
	addressLine1: UKeyType;
	addressLine2: UKeyType;
	city: UKeyType;
	stateId: UKeyType1;
	zipCode: UKeyType;
	timeZoneId: UKeyType1;
	cultureId: UKeyType1;
	staffingAgencyTypeId: UKeyType1;
	homePageUrl: UKeyType;
	securityClearanceId: UKeyType1;
	businessClassificationId: UKeyType1;
	diversityCertificationExpirationDate: UKeyType;
	paymentType: UKeyType;
	preferenceNteRateMultiplier: UKeyType1;
	generalLiabilityApprovalDate: UKeyType;
	generalLiabilityExpirationDate: UKeyType;
	autoLiabilityApprovalDate: UKeyType;
	autoLiabilityExpirationDate: UKeyType;
	workerCompApprovalDate: UKeyType;
	workerCompExpirationDate: UKeyType;
	primaryContactFirstName: UKeyType;
	primaryContactLastName: UKeyType;
	primaryContactMiddleName: UKeyType;
	primaryContactEmail: UKeyType;
	primaryContactPhoneNumber: UKeyType;
	primaryUserNumber: UKeyType1;
	alternateContactFirstName: UKeyType;
	alternateContactLastName: UKeyType;
	alternateContactMiddleName: UKeyType;
	alternateContactEmail: UKeyType;
	alternateContactPhoneNumber: UKeyType;
	alternateUserNumber: UKeyType1;
	accountingContactFirstName: UKeyType;
	accountingContactLastName: UKeyType;
	accountingContactMiddleName: UKeyType;
	accountingContactEmail: UKeyType;
	accountingContactPhoneNumber: UKeyType;
	accountingUserNumber: UKeyType1;
	isAllowedForPayroll: UKeyType2;
	isAllowedForIc: UKeyType2;
	icMarkup: UKeyType1;
	sowIcMspFee: UKeyType1;
	isAllowedForLi: UKeyType2;
	canReceiveCandidateFromAts: UKeyType2;
	isMspAfiiliated: UKeyType2;
	isAllowedForRfxSow: UKeyType2;
	sowLaborCategories: number[] | string[];
	paymentTerms: UKeyType;
	staffingAgencyName: UKeyType;
	isPrimaryUserCreated: UKeyType2;
	isAlternateUserCreated: UKeyType2;
	isAccountingUserCreated: UKeyType2;
	Disabled: UKeyType2;
	StaffingAgencyStatusId: number;
	StaffingAgencyStatus: string;
	staffingAgencyStatusId: UKeyType1;
	reasonForChange: UKeyType;
	UdfFieldRecords: IPreparedUdfPayloadData[];
	primaryRoleNo: UKeyType1;
	alternateRoleNo: UKeyType1;
	accountingRoleNo: UKeyType1;
	primaryUserId: UKeyType;
	alternateUserId: UKeyType;
	accountingUserId: UKeyType;
	cageCode: UKeyType;


	constructor(init?: Partial<StaffingAgency>) {
		super();
		Object.assign(this, init);
	}
}
