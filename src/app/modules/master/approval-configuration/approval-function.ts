import { FormBuilder } from "@angular/forms";
import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";
import { AccessToAllItems, ApplicableInEntity } from "./constant/enum";

export function allDataUpdatedAsFalseForApplicableIn(data:any) {
	const value = data.map((e: any) => {
		e.IsSelected = false;
		if (e.AccessToAllItems) {
			e.AccessToAllItems.map((f:any) => {
				f.IsSelected = false;
				return f;
			});
		}
		if (e.items) {
			e.items.map((d:any) => {
				d.IsSelected = false;
				return d;
			});
		}
		return e;
	});

	return value;
}

export function updatedApplicableIn(data: any, item: any) {
	data.filter((e: any) => {
		if (item == e.Value) {
			e.IsSelected = false;
			e.items.map((d: any) => {
				d.IsSelected = false;
				return d;
			});

		}
		return e;
	});

	return data;
}

export function checkedDuplicateSectorValue(data: any, index: any) {
	const value = data.some((d: any) => {
		return d.indexvalue === index;
	});
	return value;
}

export function filterDataBasedOnAccessToAllType(data: any, type: any) {
	const value = data.filter((e: any) => {
			return e.AccessToAllType === type;
		}),
		filteredData = value[0].ApplicableInEntities.map((e: any) => {
			e.items = e.AccessToAllItems.map((d: any) => {
				d.parentId = e.Value;
				return d;
			});
			return e;
		});
	return filteredData;
}

export function OnCategoryCheckedImplemneted(data: any, data2: any) {
	data2.forEach((dt: any) => {
		if (!dt.checked && dt.items) {
			const index = data.findIndex((locId: any) =>
				locId.Value == dt.Value);
			if (!data[index].IsSelected) {
				data[index].items.map((e: any) => {
					e.IsSelected = false;
					return e;
				});
			}
		}
		else {
			data.filter((e: any) => {
				if (e.Value == dt.parentId) {
					if (!dt.IsSelected) {
						e.IsSelected = false;
					}
					const index = e.items.findIndex((locId: any) =>
						locId.Value == dt.Value);
					e.items[index] = dt;
				}
				return e;
			});
		}
	});

	return data;
}

export function manageAccessItems(data: any, access: any = []) {
	data?.forEach((a: any) => {
		if (a.AccessToAllItems?.length > magicNumber.zero) {
			processAccessToAllItems(a, access);
		} else if ((a.AccessToAllItems?.length == magicNumber.zero && a.IsSelected) || (a.IsSelected && a.parentId)) {
			access.push({
				id: 0,
				itemId: Number(a.Value)
			});

		}
	});
	return access;
}
function processAccessToAllItems(a: any, access: any[]) {
	if (a.IsSelected) {
		a.AccessToAllItems.forEach((acc: any) => {
			const index = access.findIndex((locId: any) =>
				acc.Value == locId.itemId);
			if (index < Number(magicNumber.zero)) {
				access.push({id: 0, itemId: Number(acc.Value)
				});
			}

		});
	}
	else if(!a.IsSelected){
		a?.AccessToAllItems.forEach((acc: any) => {
			if (acc.IsSelected) {
				processAccessToAllItems2(acc, access);
			}
		});

	}
}
function processAccessToAllItems2(acc: any, access: any[]) {
	const index = access.findIndex((locId: any) =>
		acc.Value == locId.itemId);
	if (index < Number(magicNumber.zero)) {
		access.push({id: 0, itemId: Number(acc.Value)
		});
	}
}

export function formInitialization(fb: FormBuilder, _customValidators?: any) {
	return fb.group({
		ApproverTypeId: [null, [_customValidators.RequiredValidator('PleaseSelectOneToBeApprovedBy')]],
		ApproverLabel: [
			null, {
				validators: [_customValidators.RequiredValidator('PleaseEnterApproverLabel')], updateOn: 'change'}
		],
		ExceptionApprovalRequired: [false],
		ExceptionPercentage: [null],
		FundingBasedRequired: [false],
		OrgLevel1BasedRequired: [false],
		FundingMinLimit: [null],
		ApprovalConfigDetailId: 0,
		RolesDetail: [null],
		UserTypId: [null],
		UserId: [null],
		IsVisibleExceptionApprover: [false],
		IsVisibleExceptionPercentage: [false],
		IsVisibleFundingBased: [false],
		IsVisibleFundingMinLimit: [false],
		IsVisibleOrgLevel1Based: [false],
		IsVisibleRole: [false],
		IsVisibleUser: [false],
		IsVisibleUserType: [false],
		Condition: [null]
	});

}

// Approval Levels Form array binding
export function formArrayBinding(fb: FormBuilder, getData: any, _customValidators?: any) {
	return fb.group({
		subApproval: fb.array(getData.map((data: any) => {
			return fb.group({

				ApproverTypeId: fb.control({ Value: data.ApproverType.ApproverTypeId }),

				ApproverLabel: fb.control(data.ApproverType.ApproverLabel),

				ExceptionApprovalRequired: fb.control(data.ApproverType.ExceptionApprovalRequired),

				ExceptionPercentage: fb.control(data.ApproverType.ExceptionPercentage),

				// ApproverLimitUSDMasking: fb.control(data.ApproverType.ApproverLimitUSDMasking),

				FundingBasedRequired: fb.control(data.ApproverType.FundingBasedRequired),

				// MultipleApproverRequired: fb.control(data.ApproverType.MultipleApproverRequired),

				OrgLevel1BasedRequired: fb.control(data.ApproverType.OrgLevel1BasedRequired),

				FundingMinLimit: fb.control(data.ApproverType.FundingMinLimit),

				// FundingMaxLimit: fb.control(data.ApproverType.FundingMaxLimit),

				ApprovalConfigDetailId: fb.control(data.ApproverType.ApprovalConfigDetailId),

				RolesDetail: fb.control(data.ApproverType.RolesDetail),

				UserType: data.ApproverType.UserTypId
					? fb.control({
						Value: String(data.ApproverType.UserTypId)

					})
					:[null, [_customValidators.RequiredValidator('PleaseSelectUserType')]],
				SpecificUser: data.ApproverType.Userid
					? fb.control({
						Value: String(data.ApproverType.Userid)

					})
					:[null, [_customValidators.RequiredValidator('PleaseSelectUser')]],
				Condition: fb.control(data.ApproverType.Condition),
				IsApproverLimitUSDMaskingVisible: fb.control(data.
					ApproverType.IsApproverLimitUSDMaskingVisible),
				IsVisibleExceptionApprover: fb.control(data.
					ApproverType.IsVisibleExceptionApprover),

				IsVisibleExceptionPercentage:
					fb.control(data.ApproverType.ExceptionPercentage > magicNumber.zero),

				IsVisibleFundingBased: fb.control(data.ApproverType.IsVisibleFundingBased),

				IsVisibleFundingMinLimit: fb.control(data.ApproverType.FundingBasedRequired),

				IsVisibleMultipleApprover: fb.control(data.ApproverType.IsVisibleMultipleApprover),

				IsVisibleOrgLevel1Based: fb.control(data.ApproverType.IsVisibleOrgLevel1Based),

				IsVisibleRole: fb.control(data.ApproverType.IsVisibleRole),

				IsVisibleUser: fb.control(data.ApproverType.IsVisibleUser),

				IsVisibleUserType: fb.control(data.ApproverType.IsVisibleUserType)

			});

		}))
	});

}

export function bindingJSON(approvalForm:any) {
	const data = approvalForm.approvalFormArray,
		 transformedData = data.flatMap((d:any, index:number) => {
		  return d.subApproval.map((m:any, subIndex:number) => {
				m.ApproverTypeId = m.ApproverTypeId?.Value
					? m.ApproverTypeId.Value
					: m.ApproverTypeId;
				m.UserTypId = m.UserTypId?.Value
					? m.UserTypId.Value
					: m.UserTypId;
				m.UserId = m.UserId?.Value
					? m.UserId.Value
					: m.UserId;


				d.level = index+magicNumber.one;
				d.sublevel = subIndex+magicNumber.one;
				d.ApprovalConfiguration = m;
				return { level: d.level, sublevel: d.sublevel, ApprovalConfiguration: d.ApprovalConfiguration };
		  });
		});
	return {"ApprovalConfigurationDetails": transformedData};
	  }

export const controlNames = [
	'IsAllSectorApplicable',
	'IsAllLocationApplicable',
	'IsAllOrgLevel1Applicable',
	'IsAllLaborCategoryApplicable',
	'IsAllReasonForRequestApplicable'
];
