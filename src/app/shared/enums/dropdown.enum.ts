
/* eslint-disable no-magic-numbers */
// eslint-disable-next-line no-shadow
export enum Dropdown
{
left='left',
right='right'
}
/* eslint-disable no-magic-numbers */
// eslint-disable-next-line no-shadow
export enum StartColor
{
  red='red',
  black='black'
}
/* eslint-disable no-magic-numbers */
// eslint-disable-next-line no-shadow
export enum TagVisibility
{
  All= 'All',
  Custom='Custom'
}

export const dialogAction= [
  { text: "Yes", value: 'Yes' },
  { text: "No", value: 'No' }
];

export interface DialogActionModel {
	text: string;
	value: string;
}

export const DisplayCanSuppliersContactQuestionReq = "Display 'Can suppliers contact' question in Req";

export const	AllowCLPstoEnterCharges = "Allow CLPs to Enter Charge #'s";

export const	displayNoThanksToSkipSurvey = "Display 'No Thanks' to Skip Survey";

export const listOfStatus = [
  { Text: 'Active', Value: 'Active' },
  { Text: 'Draft', Value: 'ProbatiDrafton' },
  { Text: 'Inactive', Value: 'Inactive' }
];