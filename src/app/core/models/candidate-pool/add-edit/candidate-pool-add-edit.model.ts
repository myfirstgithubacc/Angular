import { IPreparedUdfPayloadData } from "@xrm-shared/common-components/udf-implementation/Interface/udf-common.model";
import { CandidatePoolPreferableAssignmentType } from "../candidate-pool-preferable-assign.model";
import { CandidatePoolPreferableLocation } from "../candidate-pool-preferable-location.model";
import { CandidatePoolPreferableSector } from "../candidate-pool-preferable-sector.model";
import { DMSApiRequestPayload } from "@xrm-shared/common-components/dms-implementation/utils/dms-implementation.interface";

type nullableString = string | null;

export interface CandidatePoolAddEdit {
    Id: number;
    UKey: string;
    Code: string;
    CandidateName: string;
    StaffingAgencyName: string;
    Disabled: boolean;
    IsUsedInAssignment: boolean;
    CandidateFirstName: string;
    CandidateMiddleInitial: string;
    CandidateLastName: string;
    EmailAddress: nullableString;
    ContactNumber: nullableString;
    PhoneNumberExt: nullableString;
    PreviouslyPlacedAtThisClient: boolean;
    WorkDetails: string | null;
    PreferredShift: string;
    DrugScreenId: number;
    DrugScreenName: string;
    DrugScreenResultId: number | null;
    DrugScreenResultName: nullableString;
    DrugResultDate: nullableString;
    BackgroundCheckId: number;
    BackGroundCheckName: string;
    BackgroundResultDate: nullableString;
    IsCandidateEligibleForSecurityClearance: boolean;
    CurrentSecurityClearanceLevel: nullableString;
    PreferredSectors: CandidatePoolPreferableSector[];
    PreferredLocations: CandidatePoolPreferableLocation[];
    PreferredAssignmentTypes: CandidatePoolPreferableAssignmentType[];
    UId: string;
    IsUsedInActiveAssignment:boolean;
    ReasonForChange?: string;
    CountryId?: string;
    candidatePoolId? : number;
    UdfFieldRecords?: IPreparedUdfPayloadData[];
    dmsFieldRecords? : DMSApiRequestPayload[]
}
