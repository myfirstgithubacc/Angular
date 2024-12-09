import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreMasterComponent } from './core-master.component';
import { FieldLevelAuthComponent } from './FieldLevelAuth/FieldLevelAuth.component';

const routes: Routes = [
	{
		path: '',
		component: CoreMasterComponent,
		children: [
			{ path: '', pathMatch: 'full', redirectTo: 'labor-category' },
			{
				path: 'labor-category',
				data: { breadcrumb: 'LaborCategory', title: 'LaborCategory' },
				loadChildren: () =>
					import('./labor-category/labor-category.module').then((m: any) =>
						m.LaborCategoryModule)
			},
			{
				path: 'reactive-forms',
				data: { breadcrumb: 'Reactive Forms', title: 'Reactive Forms' },
				loadChildren: () =>
					import('./reactiveforms/reactiveforms.module').then((m: any) =>
						m.ReactiveformsModule)
			},
			{
				path: 'organization-level1',
				data: {
					breadcrumb: 'OrgLevel1',
					title: 'OrgLevel1'
				},
				loadChildren: () =>
					import('./organization-level/organization-level-1/organization-level1.module').then((m: any) =>
						m.OrganizationLevel1Module)
			},
			{
				path: 'organization-level2',
				data: {
					breadcrumb: 'OrgLevel2',
					title: 'OrgLevel2'
				},
				loadChildren: () =>
					import('./organization-level/organization-level-2/organization-level-2.module').then((m: any) =>
						m.OrganizationLevel2Module)
			},
			{
				path: 'organization-level3',
				data: {
					breadcrumb: 'OrgLevel3',
					title: 'OrgLevel3'
				},
				loadChildren: () =>
					import('./organization-level/organization-level-3/organization-level-3.module').then((m) =>
						m.OrganizationLevel3Module)
			},
			{
				path: 'organization-level4',
				data: {
					breadcrumb: 'OrgLevel4',
					title: 'OrgLevel4'
				},
				loadChildren: () =>
					import('./organization-level/organization-level-4/organization-level-4.module').then((m: any) =>
						m.OrganizationLevel4Module)
			},
			{
				path: 'requisition-library',
				data: {
					breadcrumb: 'RequisitionLibrary',
					title: 'RequisitionLibrary'
				},
				loadChildren: () =>
					import('./requisition-library/requisition-library.module').then((m) =>
						m.RequisitionLibraryModule)
			},
			{
				path: 'sample',
				data: { breadcrumb: 'Sample', title: 'Sample' },
				loadChildren: () =>
					import('./sample/sample.module').then((m) =>
						m.SampleModule)
			},
			{
				path: 'preference',
				data: { breadcrumb: 'Preference', title: 'Preference' },
				title: 'Preference',
				loadChildren: () =>
					import('./preference/preference.module').then((m) =>
						m.PreferenceModule)
			},
			{
				path: 'user-defined-fields',
				data: {
					breadcrumb: 'User Defined Field',
					title: 'User Defined Field'
				},
				loadChildren: () =>
					import('./user-defined-fields/user-defined-fields.module').then((m) =>
						m.UserDefinedFieldsModule)
			},
			{
				path: 'user-defined-fields-pick-list',
				data: {
					breadcrumb: 'Predefined List',
					title: 'Predefined List'
				},
				loadChildren: () =>
					import('./user-defined-field-pick-list/user-defined-field-pick-list.module').then((m) =>
						m.UserDefinedFieldPickListModule)
			},
			{
				path: 'job-category',
				data: { breadcrumb: 'Job Category', title: 'Job Category' },
				loadChildren: () =>
					import('./job-category/job-category.module').then((m) =>
						m.JobCategoryModule)
			},
			{
				path: 'auto-process',
				data: { breadcrumb: 'Auto Process Configuration', title: 'Auto Process Configuration' },
				loadChildren: () =>
					import('./autoprocess-configuration/autoprocess-configuration.module').then((m) =>
						m.AutoprocessConfigurationModule)
			},
			{
				path: 'charge-approver',
				data: { breadcrumb: 'Charge Approver', title: 'Charge Approver' },
				loadChildren: () =>
					import('./charge-approver/charge-approver.module').then((m) =>
						m.ChargeApproverModule)
			},
			{
				path: 'configure-client',
				data: { breadcrumb: 'Configure Client', title: 'Configure Client' },
				loadChildren: () =>
					import('./configure-client/configure-client.module').then((m) =>
						m.ConfigureClientModule)
			},
			{
				path: 'minimum-clearance-to-start',
				data: {
					breadcrumb: 'Minimum Clearance to Start',
					title: 'Minimum Clearance to Start'
				},
				loadChildren: () =>
					import('./minimum-clearance-to-start/minimum-clearance-to-start.module').then((m) =>
						m.MinimumClearanceToStartModule)
			},
			{
				path: 'expense-type',
				data: { breadcrumb: 'Expense Type', title: 'Expense Type' },
				loadChildren: () =>
					import('./expense-type/expense-type.module').then((m) =>
						m.ExpenseTypeModule)
			},
			{
				path: 'reason-for-request',
				data: { breadcrumb: 'Reason For Request', title: 'Reason For Request' },
				loadChildren: () =>
					import('./reason-for-request/reason-for-request.module').then((m) =>
						m.ReasonForRequestModule)
			},
			{
				path: 'sector',
				data: { breadcrumb: 'Sector', title: 'Sector' },
				loadChildren: () =>
					import('./sector/sector.module').then((m) =>
						m.SectorModule)
			},
			{
				path: 'hour-distribution-rule',
				data: { breadcrumb: 'Hour Distribution Rule', title: 'hour-distribution-rule' },
				loadChildren: () =>
					import('./hour-distribution-rule/hour-distribution-rule.module').then((m) =>
						m.HourDistributionRuleModule)
			},
			{
				path: 'role',
				data: { breadcrumb: 'Role', title: 'Role' },
				loadChildren: () =>
					import('./role/role.module').then((m) =>
						m.RoleModule)
			},
			{
				path: 'shift',
				data: { breadcrumb: 'Shift', title: 'Shift' },
				loadChildren: () =>
					import('./shift/shift.module').then((m) =>
						m.ShiftModule)
			},
			{
				path: 'email-template',
				data: { breadcrumb: 'Email Template Configuration', title: 'Email Template Configuration' },
				loadChildren: () =>
					import('./email-template/email-template.module').then((m) =>
						m.EmailTemplateModule)
			},
			{
				path: 'termination-reason',
				data: { breadcrumb: 'Termination Reason', title: 'Termination Reason' },
				loadChildren: () =>
					import('./termination-reason/termination-reason.module').then((m) =>
						m.TerminationReasonModule)
			},
			{
				path: 'ui-team/ui-welcome',
				loadChildren: () =>
					import('./_ui-team/ui-welcome/ui-welcome.module').then((m) =>
						m.UiWelcomeModule)
			},
			{
				path: 'event-reason',
				data: { breadcrumb: 'Event Reason', title: 'Event Reason' },
				loadChildren: () =>
					import('./event-reason/event-reason.module').then((m) =>
						m.EventReasonModule)
			},
			{
				path: 'worker-classification',
				data: { breadcrumb: 'Worker Classification', title: 'Worker Classification' },
				loadChildren: () =>
					import('./worker-classification/worker-classification.module').then((m) =>
						m.WorkerClassificationModule)
			},
			{
				path: 'cost-accounting-code',
				data: { breadcrumb: 'Cost Accounting Code', title: 'Cost Accounting Code' },
				loadChildren: () =>
					import('./cost-accounting-code/cost-accounting-code.module').then((m) =>
						m.CostAccountingCodeModule)
			},
			{
				path: 'approval-configuration',
				data: { breadcrumb: 'ApprovalConfiguration', title: 'ApprovalConfiguration' },
				loadChildren: () =>
					import('./approval-configuration/approval-configuration.module').then((m) =>
						m.ApprovalConfigurationModule)
			},
			// {
			// 	path: 'approval-configuration-widget',
			// 	data: { breadcrumb: 'Approval Configuration Widget', title: 'Approval Configuration Widget' },
			// 	loadChildren: () =>
			// 		import('./approval-configuration-widget/approval-configuration-widget.module').then((m) =>
			// 			m.ApprovalConfigurationWidgetModule)
			// },
			{
				path: 'location',
				data: { breadcrumb: 'Location', title: 'Location' },
				loadChildren: () =>
					import('./location/location.module').then((m) =>
						m.LocationModule)
			},

			{
				path: 'staffing-agency',
				data: { breadcrumb: 'StaffingAgency', title: 'StaffingAgency' },
				loadChildren: () =>
					import('./staffing-agency/staffing-agency.module').then((m) =>
						m.StaffingAgencyModule)
			},
			{
				path: 'markup',
				data: { breadcrumb: { skip: true }, title: 'Markup-Configuration' },
				loadChildren: () =>
					import('./staffing-agency-markup/staffing-agency-markup.module').then((m) =>
						m.StaffingAgencyMarkupModule)
			},
			{
				path: 'user',
				data: { breadcrumb: 'Users', title: 'Users' },
				loadChildren: () =>
					import('./user/user.module').then((m) =>
						m.UserModule)
			},
			{
				path: 'document-configuration',
				data: { breadcrumb: 'Document Upload Configuration', title: 'Document Upload Configuration' },
				loadChildren: () =>
					import('./document-configuration/document-configuration.module').then((m) =>
						m.DocumentConfigurationModule)
			},
			{
				path: 'rest-meal-break-configuration',
				data: { breadcrumb: 'Rest/Meal Break Configuration', title: 'Rest/Meal Break Configuration' },
				loadChildren: () =>
					import('./rest-meal-break/rest-meal-break.module').then((m) =>
						m.RestMealBreakModule)
			},
			{
				path: 'field-level-auth',
				component: FieldLevelAuthComponent,
				title: 'Field Level Auth',
				data: { title: 'Field Level Auth  ', breadcrumb: '' }
			},
			{
				path: 'rate-configuration',
				data: { breadcrumb: 'RateCalculator', title: 'RateCalculator' },
				loadChildren: () =>
					import('./rate-configuration/rate-configuration.module').then((m) =>
						m.RateConfigurationModule)
			},
			{
				path: 'retiree-options',
				data: { breadcrumb: 'RetireeOption', title: 'RetireeOption' },
				loadChildren: () =>
					import('./retiree-options/retiree-options.module').then((m) =>
						m.RetireeOptionsModule)
			},
			{
				path: 'candidate-decline-reason',
				data: { breadcrumb: 'CandidateDeclineReason', title: 'CandidateDeclineReason' },
				loadChildren: () =>
					import('./candidate-decline-reason/candidate-decline-reason.module').then((m) =>
						m.CandidateDeclineReasonModule)
			},
			{
				path: 'business-classification',
				data: { breadcrumb: 'Business Classification', title: 'Business Classification' },
				loadChildren: () =>
					import('./business-classification/business-classification.module').then((m) =>
						m.BusinessClassificationModule)
			},
			{
				path: 'bulk-data-management',
				data: { breadcrumb: 'Bulk Data Management', title: 'Bulk Data Management' },
				loadChildren: () =>
					import('./bulk-data-management/bulk-data-management.module').then((m) =>
						m.BackendUploadModule)
			},
			{
				path: 'manage-country',
				data: {
					breadcrumb: 'Manage Country',
					title: 'Manage Country'
				},
				loadChildren: () =>
					import('./manage-country/manage-country.module').then((m) =>
						m.ManageCountryModule)
			},
			{
				path: 'event-reason',
				data: {
					breadcrumb: 'Event Reason',
					title: 'Event Reason'
				},
				loadChildren: () =>
					import('./event-reason/event-reason.module').then((m) =>
						m.EventReasonModule)
			},
			{
				path: 'email-template',
				data: {
					breadcrumb: 'Email Template',
					title: 'Email Template'
				},
				loadChildren: () =>
					import('./email-template/email-template.module').then((m) =>
						m.EmailTemplateModule)
			},
			{
				path: 'request-cancel-close-reason',
				data: {
					breadcrumb: 'Request Cancel/Close Reason',
					title: 'Request Cancel/Close Reason'
				},
				loadChildren: () =>
					import('./request-cancel-close-reason/request-cancel-reason.module').then((m) =>
						m.RequestCancelReasonModule)
			},
			{
				path: 'candidate-selection-reason',
				data: { breadcrumb: 'Candidate Selection Reason', title: 'Candidate Selection Reason' },
				loadChildren: () =>
					import('./candidate-selection-reason/candidate-selection-reason.module').then((m) =>
						m.CandidateSelectionReasonModule)
			},
			{
				path: 'event-configuration',
				data: { breadcrumb: 'EventConfiguration', title: 'EventConfiguration' },
				loadChildren: () =>
					import('./event configuration/event-configuration.module').then((m) =>
						m.EventConfigurationModule)
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MasterRoutingModule { }
