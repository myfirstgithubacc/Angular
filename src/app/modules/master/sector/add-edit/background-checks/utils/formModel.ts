import { FormArray, FormControl } from "@angular/forms";

export interface IBackgroundChecksFormControls {
    Id: FormControl<number | null>;
    AllowToFillCandidateWithPendingCompliance: FormControl<boolean | null>;
    AllowAttachPreEmploymentDocToClientEmail: FormControl<boolean | null>;
    IsActiveClearance: FormControl<boolean | null>;
    IsDrugResultVisible: FormControl<boolean | null>;
    IsDrugScreenItemEditable: FormControl<boolean | null>;
    DefaultDrugResultValue: FormControl<string | null>;
    IsBackGroundCheckVisible: FormControl<boolean | null>;
    IsBackGroundItemEditable: FormControl<boolean | null>;
    DefaultBackGroundCheckValue: FormControl<string | null>;
    SectorId: FormControl<number | null>;
    SectorUkey: FormControl<number | null>;
    StatusCode: FormControl<number | null>;
    ReasonForChange: FormControl<string | null>;
    SectorBackgrounds: FormArray;
  }
