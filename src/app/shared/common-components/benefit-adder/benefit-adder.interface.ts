type NullableNumber = number | null;

export interface IBenefitAdderData {
    Id: number;
    Label: string;
    LabelLocalizedKey: string;
    LocationId: NullableNumber;
    SectorId: number;
    UKey: string;
}

export interface IBenefitData {
    Id?: number
    ReqLibraryBenefitAdderId: number;
    LocalizedLabelKey: string;
    Value: number;
}

export interface IFinalBenefitData {
    text: string,
    value: string
}

