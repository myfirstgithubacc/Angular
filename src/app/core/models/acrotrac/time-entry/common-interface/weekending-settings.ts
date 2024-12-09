import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";

export interface WeekendingSettings {
	Action: "addedit" | "view" | "List" | "adjust-add-edit" | "review" | "time-adjustment-view" | "time-adjustment-review",
	RouteOrigin: "List" | "AddEdit" | "SideBar",
	ScreenId: magicNumber.one | magicNumber.two | magicNumber.three,
}
