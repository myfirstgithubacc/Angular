import { ToJson } from '../responseTypes/to-json.model';
import { CandidatePoolPreferableAssignmentType } from './candidate-pool-preferable-assign.model';
import { CandidatePoolPreferableLocation } from './candidate-pool-preferable-location.model';
import { CandidatePoolPreferableSector } from './candidate-pool-preferable-sector.model';

type nullableNumber = number | undefined | null;
type nullableString = string | undefined | null;
type nullableBoolean = boolean | undefined | null;
type nullableDate = Date | undefined | null;
export class CandidatePool extends ToJson {

	Id: nullableNumber;
	UKey: string;
	CountryId: nullableString;
	CandidateId: nullableString;
	CandidateName: nullableString;
	EmailAddress: nullableString;
	ContactNumber: nullableNumber;
	PreviouslyPlacedAtThisClient: nullableString;
	PreferredShift: nullableString;
	CurrentSecurityClearanceLevel: nullableString;
	CreatedBy: nullableString;
	CreatedOn: nullableDate;
	LastModifiedBy: nullableString;
	LastModifiedOn: nullableDate;
	StaffingAgencyId: nullableNumber;
	FirstName: nullableString;
	MiddleInitial: nullableString;
	LastName: nullableString;
	WorkDetails: nullableString;
	DrugScreenCompleted: nullableBoolean;
	DrugScreenResult: nullableNumber;
	DrugScreenResultName: nullableString;
	DrugResultDate: nullableString;
	BackgroundCheckInitiated: nullableBoolean;
	BackgroundResultDate: nullableString;
	IsCandidateEligibleForSecurityClearance: nullableBoolean;
	PreferredSectors: CandidatePoolPreferableSector[];
	PreferredLocations: CandidatePoolPreferableLocation[];
	PreferredAssignmentTypes: CandidatePoolPreferableAssignmentType[];
	Code: nullableString;
	Disabled: nullableBoolean;
	Status: nullableString;
	ReasonForChange: nullableString;
	candidatePoolId: nullableNumber;
	constructor(init?: Partial<CandidatePool>) {
		super();
		Object.assign(this, init);
	}
}
