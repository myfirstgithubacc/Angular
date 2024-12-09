import { Component, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup} from '@angular/forms';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { NavigationPaths } from '../constants/routeConstants';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { EmailTemplateService } from 'src/app/services/masters/email-template.service';
import { EMPTY, Subject, catchError, of, switchMap, takeUntil} from 'rxjs';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { EmailTemplate, AttachmentsData, FieldList, Recipient, RecipientDTO } from '../constants/models';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { HttpResponse } from '@angular/common/http';

@Component({selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit, OnDestroy{

	public emailTemplatedetails: EmailTemplate;
	public editTemplateSpecificSector : string;
	public body:string;
	public previewTemplate: string;

	public toRecipients: Recipient[];
	public ccRecipients: Recipient[];
	public bccRecipients: Recipient[];

	public subject: string;
	public entityId = XrmEntities.EmailTemplate;

	public statusForm: FormGroup;
	public emailTemplateGridData: AttachmentsData[] = [];
	private destroyAllSubscribtion$ = new Subject<void>();

	private AllDynamicFieldList: FieldList[] = [];
	public isReviewLinkValue: boolean = false;

	constructor(
		private router: Router,
		private emailTemplateService: EmailTemplateService,
		private toasterServ: ToasterService,
		private activatedRoute:ActivatedRoute
	) {}

	ngOnInit() {

		this.emailTemplateService.getConfigurableDynamicFields().pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe({
			next: (data: ApiResponse) => {
				this.AllDynamicFieldList = [...data.Data];
			}
		});

		this.activatedRoute.params
			.pipe(
				takeUntil(this.destroyAllSubscribtion$),
				switchMap((param: Params) => {
					if (param['id']) {
						this.getEmailTemplateById(param['id']);
					}
					return of(null);
				}),
				catchError((error: Error) => {
					return EMPTY;
				})
			)
			.subscribe();
	}

	private getEmailTemplateById(id: string) {
		this.emailTemplateService.getEmailTemplateById(id).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((data: ApiResponse) => {
			this.emailTemplatedetails = data.Data.Data;
			this.emailTemplateGridData= data.Data.Data.TemplateAttachmentGetAllDto;
			this.emailTemplateService.emailTemplateData.next({'Disabled': this.emailTemplatedetails.TemplateDetailGetAllDto.Disabled, 'RuleCode': this.emailTemplatedetails.TemplateMasterGetAllDto.Code, 'Id': this.emailTemplatedetails.TemplateMasterGetAllDto.Id});
			this.getEmailSubjectBody(this.emailTemplatedetails);
			this.getBasicDetails(this.emailTemplatedetails.SectorName??null);
			this.getRecipientDetails(this.emailTemplatedetails.TemplateRecipientGetAllDtos);
			this.isReviewLinkValue = this.emailTemplatedetails.TemplateMasterGetAllDto.IsReviewLink;

		});
	}

	getEmailSubjectBody(data:EmailTemplate){
		this.subject = data.TemplateDetailGetAllDto.SubjectTemplate;
		this.body = data.TemplateDetailGetAllDto.BodyTemplate;

		this.previewTemplate= '<table class="email__template-bodyline" cellpadding="0" cellspacing="0" width="100%"><tr><td><table class="inner-table" cellpadding="0" cellspacing="0" width="100%" align="center" border="0"><tr><td>[BodyHtml]</td></tr></table>';
		this.previewTemplate = this.previewTemplate.replace('[BodyHtml]', this.body);

		this.subject = this.idToName(this.subject);
		this.body = this.idToName(this.body);
	}

	getBasicDetails(data: string | null){
		this.editTemplateSpecificSector = data === null
			? 'No'
			: 'Yes';
	}

	getRecipientDetails(data: RecipientDTO){
		this.toRecipients = data.To;
		this.ccRecipients = data.Cc;
		this.bccRecipients = data.Bcc;
	}

	getRecipientNames(recipients: Recipient[]): string {
		return recipients.map((rec: Recipient) =>
			rec.UserTypeName
				? rec.UserTypeName
				: rec.RecipientTypeName).join(', ');
	}

	private idToName(value: string){
		const draggables = value.split('[');
		for(const a of this.AllDynamicFieldList){
			for(const ele of draggables){
				const element = ele.substring(magicNumber.zero, ele.lastIndexOf(']'));
				if(a.Id === element)
				{
					value = value.replace(`[${element}]`, `[${a.LocalizedValue}]`);
				}
			}
		}

		return value;
	}

	 public downloadRecords(dataitem: AttachmentsData){
		this.emailTemplateService.downloadRecords(dataitem.DocumentManagemenstSystemId)
			.pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: HttpResponse<Blob>) => {
				if(res.body){
					const url = window.URL.createObjectURL(res.body),
						a = document.createElement('a'),
						fileNameWithExtension = `${dataitem.DocumentName }.${ dataitem.DocumentExtension}`;
					a.href = url;
					a.download = fileNameWithExtension;
					a.click();
					window.URL.revokeObjectURL(url);
				}
			});
	}

	getIconUrl(extension: string): string {
		if (extension === 'docx') {
			return 'assets/images/docx.png';
		} else if (extension === 'pdf') {
			return 'assets/images/pdf.png';
		} else if(extension === 'doc'){
			return 'assets/images/doc.png';
		}else{
			return '';
		}
	}

	OnBackBtnClick(){
		this.router.navigate([NavigationPaths.list]);
	}

	ngOnDestroy(): void {
		this.toasterServ.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
