import { NavigationPathsType } from "./contractor-interface";

export const NavigationPaths: NavigationPathsType = {
	addEdit: 'xrm/contractor/contractor-details/add-edit',
	view: '/xrm/contractor/contractor-details/view',
	list: '/xrm/contractor/contractor-details/list',
	apiAddress: 'contr/paged',
	advApiAddress: 'contr/select-paged'
};

export enum ContractorLocKeys{
	AccountActivationEmailSent = 'AccountActivationEmailSent',
	Somethingwentwrong = 'Somethingwentwrong',
	EmptyString = '',
	NA = 'N/A'
}
