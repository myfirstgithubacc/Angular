import { DynamicParam } from "@xrm-shared/services/Localization/DynamicParam.interface";

export interface TimerangeWidget {
    startTime: Date | undefined | null;
    endTime: Date | undefined | null;
    label1: string;
    label2: string;
    isAllowPopup: boolean;
    labelLocalizeParam1: DynamicParam[];
    labelLocalizeParam2: DynamicParam[];
    RenderMode: boolean;
    DefaultInterval: number;
    AllowAI: boolean;
    isEditMode: boolean;
    startisRequired: boolean;
    endisRequired: boolean;
    timeFormat?: Date;
    starttooltipVisible: boolean;
    starttooltipTitle: string;
    starttooltipPosition: string;
    starttooltipTitleLocalizeParam: DynamicParam[];
    startlabelLocalizeParam: DynamicParam[];
    startisHtmlContent: boolean;
    endtooltipVisible: boolean;
    endtooltipTitle: string;
    endtooltipPosition: string;
    endtooltipTitleLocalizeParam: DynamicParam[];
    endlabelLocalizeParam: DynamicParam[];
    endisHtmlContent: boolean;

}
