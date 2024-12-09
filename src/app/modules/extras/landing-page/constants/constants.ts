export interface FavoritesList {
	EntityId: number;
	EntityIdUrl: string;
	EntityLocalizedKey: string;
	Disabled: boolean;
	label?: string | null;
}

export interface ActionItemsList {
	ActionItemName: string;
	NavigationUrl: string;
	GatewayUrl: string;
	DefaultSelectedTab: string | null;
	ListAdvanceSearchFormControlName: any[];
	count?: number;
	EntityId: number;
}
