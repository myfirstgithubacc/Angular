import { AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SectorService } from 'src/app/services/masters/sector.service';
import { ToasterService } from '@xrm-shared/services/toaster.service';
import { ToastOptions } from '@xrm-shared/enums/toast-options.enum';
import { EMPTY, Subject, catchError, forkJoin, of, switchMap, takeUntil } from 'rxjs';
import { EmailTemplateService } from 'src/app/services/masters/email-template.service';
import { CustomValidators } from '@xrm-shared/services/custom-validators.service';
import { ConfigureClientService } from 'src/app/services/masters/configure-client.service';
import { XrmEntities } from '@xrm-shared/services/common-constants/XrmEntities.enum';
import { magicNumber } from '@xrm-shared/services/common-constants/magic-number.enum';
import { NavigationPaths } from '../constants/routeConstants';
import { EventLogService } from '@xrm-shared/services/event-log.service';
import { AttachmentsDTO, DynamicAttachmentDTO, EmailTemplate, EmailTemplatePayload, FieldList, Recipient, RecipientDTO, StaticAttachmentDTO } from '../constants/models';
import { ApiResponse } from '@xrm-core/models/responseTypes/api-response.model';
import { ComboBoxComponent, DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { FileInfo, SelectEvent } from '@progress/kendo-angular-upload';
import { IStatusCardData } from '@xrm-shared/models/common.model';
import { dropdownModel, dropdownWithExtras } from '@xrm-core/models/job-category.model';
import { GenericResponseBase } from '@xrm-core/models/responseTypes/generic-response.interface';
import { HttpResponse } from '@angular/common/http';
import { FileUploadDetails } from '@xrm-shared/common-components/dms-implementation/utils/dms-implementation.interface';
import { WindowScrollTopService } from '@xrm-shared/services/window-scroll-top.service';
import { CommonService } from '@xrm-shared/services/common.service';
import { AdditionalRecipients } from '../constants/additional-recipients.enum';

@Component({selector: 'app-edit',
	templateUrl: './add-edit.component.html',
	styleUrls: ['./add-edit.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked{

	@ViewChild('Role') Role: ComboBoxComponent;

	@ViewChild('User') User: ComboBoxComponent;

	@ViewChild('UserTypeList') UserType: ComboBoxComponent;

	public filterSettings: DropDownFilterSettings = {
		caseSensitive: false,
		operator: 'contains'
	};

	private currentRoleType: dropdownModel = {Text: '', Value: ''};

	public emailData: Recipient[];

	private BackupList: Recipient[] | string = [];

	private footerData: {key: string, value: string}[] = [];

	public EmailTemplate: EmailTemplate;

	public touched: boolean = false;

	public RoleDropdown: boolean = false;

	public UserDropdown: boolean = false;

	public UserTextbox: boolean = false;

	public dialogRecipient: boolean = false;

	public previewDialogOpen: boolean = false;

	public isSectorVisible: boolean = false;

	public isUserTemplate: boolean = false;

	public isReviewLinkValue: boolean = false;

	private recordId: string;

	public entityId = XrmEntities.EmailTemplate;

	public EditEmailConfigurationForm: FormGroup;

	public listForm: FormGroup;

	public statusForm: FormGroup;

	public attachmentForm: FormGroup;

	public body: string;

	private footer: string;

	public previewTemplate: string;

	public footerSignature: string;

	public toRecipients: Recipient[];

	public ccRecipients: Recipient[];

	public bccRecipients: Recipient[];

	public ConfigurableDynamicFieldlist: FieldList[] = [];

	private ConfigurableDynamicFieldlistBackup: FieldList[] = [];

	public UDFDynamicFieldlist: FieldList[] = [];

	public UDFDynamicFieldlistBackup: FieldList[] = [];

	public BasicDetailsDynamicFieldlist: FieldList[] = [];

	public BasicDetailsDynamicFieldlistBackup: FieldList[] = [];

	private AllDynamicFieldList: FieldList[] = [];

	public sectorDropDownList: dropdownWithExtras[] | null | undefined;

	public languageDropDownList: dropdownWithExtras[]= [];

	public RecipientDropDownList: dropdownWithExtras[];

	public RoleDropDownList: dropdownWithExtras[];

	public UserDropDownList: string[] = [];

	public DocumentDrpList:dropdownWithExtras[] | null | undefined = [];

	public emailTemplateGridData: AttachmentsDTO[] = [];

	private entityIdDrpList: number;

	private destroyAllSubscribtion$ = new Subject<void>();

	private fileSize: number;

	private templateId: number;

	private staticAttachmentData: StaticAttachmentDTO[]=[];

	private dynamicAttachmentData: DynamicAttachmentDTO[]=[];

	private bodyPatched: boolean = false;

	private dynamicFieldList: boolean = false;

	private staticFieldList: boolean = false;

	private timeoutId: number | undefined;


	public statusData: IStatusCardData = {
		items: []
	};

	Priority: dropdownModel[] = [
		{
			Text: "HighImportance", Value: '191'
		},
		{
			Text: "LowImportance", Value: '192'
		}
	];

	attachments: dropdownWithExtras[] | null | undefined =[
		{
			Text: "Static", Value: '1'
		},
		{
			Text: "Dynamic", Value: '2'
		}
	];

	// eslint-disable-next-line max-params
	constructor(
    	private fb:FormBuilder,
    	private activatedRoute: ActivatedRoute,
		private scrollService: WindowScrollTopService,
		private configureClientService: ConfigureClientService,
    	private route: Router,
		private sectorService: SectorService,
    	private emailTemplateService: EmailTemplateService,
    	private toasterServc: ToasterService,
		private customvalidator: CustomValidators,
		private eventLogService: EventLogService,
		private cdr: ChangeDetectorRef,
		private commonService: CommonService
	) {
		this.EditEmailConfigurationForm = this.fb.group({
			editor: ['<tr style="height: 135px;"><td></td></tr>'],
			EditTemplateForSector: [false],
			Sector: [null],
			Language: [{Value: '1'}, [this.customvalidator.RequiredValidator('PleaseSelectData', [{Value: 'Language', IsLocalizeKey: true}])]],
			Priority: ['191'],
			SubjectName: [null, [this.customvalidator.RequiredValidator('PleaseEnterData', [{Value: 'Subject', IsLocalizeKey: true}])]],
			DmsDocumentTitle: [null]
		});

		this.attachmentForm = this.fb.group({
			DocumentTitleDrp: [null],
			Upload: [],
			radiobtn: ['1'],
			Delete: [],
			DocumentTitleValue: [null],
			documentType: [null],
			DocumentFileName: [null],
			DocumentTitle: [null, [this.customvalidator.RequiredValidator('PleaseEnterData', [{Value: 'DocumentTitle', IsLocalizeKey: true}])]]
		});

		this.listForm = this.fb.group({
			Email: [null, [this.customvalidator.EmailValidator()]]
		});

	}

	ngAfterViewChecked(): void {
		if(!this.bodyPatched && this.dynamicFieldList && this.staticFieldList)
		{
			const body = this.idToName(this.EmailTemplate.TemplateDetailGetAllDto.BodyTemplate),
				reduced = this.getSubject(this.EmailTemplate.TemplateDetailGetAllDto.SubjectTemplate),
				subject = this.idToName(reduced);

			this.EditEmailConfigurationForm.patchValue({
				SubjectName: this.idToName(subject),
				editor: body
			});

			this.bodyPatched = true;
			this.scrollService.scrollTop();
			this.cdr.markForCheck();
		}
	}

	private getSubject(subject: string){
		const clientName = this.ConfigurableDynamicFieldlist.findIndex((element: FieldList) => {
				return element.LocalizedKey === 'ClientName';
			}),
			starter = parseInt(this.ConfigurableDynamicFieldlist[clientName].Id.toString());

		if(subject.startsWith(`[${starter}]`)){
			return subject.substring(subject.indexOf('-') + magicNumber.two);
		}

		return subject;
	}

	ngOnInit(): void {
		try{
			this.getDropdowns();
			this.activatedRoute.params
				.pipe(
					takeUntil(this.destroyAllSubscribtion$),
					switchMap((param: Params) => {
						if (param['id']) {
							this.getEmailTemplateById(param['id']);
							this.scrollService.scrollTop();
						}
						return of(null);
					}),
					catchError(() => {
						return EMPTY;
					})
				)
				.subscribe();
		}
		catch(e){ /* empty */ }
	}

	private getDropdowns(){
		forkJoin([
			this.sectorService.getSectorDropDownList(),
			this.emailTemplateService.getConfigurableDynamicFields()
		]).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(([
			sectorDropDownList,
			dynamicFieldlist
		]) => {
			this.sectorDropDownList = sectorDropDownList.Data;
			this.ConfigurableDynamicFieldlist = dynamicFieldlist.Data;
			this.ConfigurableDynamicFieldlistBackup = dynamicFieldlist.Data;
			this.AllDynamicFieldList = [...this.AllDynamicFieldList, ...dynamicFieldlist.Data];
			this.staticFieldList = true;
			this.cdr.markForCheck();
		});
	}

	ngAfterViewInit(){
		this.emailTemplateService.getEmailTemplateDynamicTitleDrp(this.entityIdDrpList).
			pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((data: ApiResponse) => {
				this.DocumentDrpList=data.Data;
				this.cdr.markForCheck();
			});
	}

	private getEmailTemplateById(id: string){
		this.emailTemplateService.getEmailTemplateById(id).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: ApiResponse) => {
			this.EmailTemplate = res.Data.Data;
			this.entityIdDrpList= res.Data.Data.TemplateMasterGetAllDto.XrmEntityId;
			this.isReviewLinkValue = this.EmailTemplate.TemplateMasterGetAllDto.IsReviewLink;
			this.recordId= this.EmailTemplate.TemplateMasterGetAllDto.Code;
			this.eventLogService.recordId.next(this.EmailTemplate.TemplateDetailGetAllDto.Id);
			this.eventLogService.entityId.next(XrmEntities.EmailTemplate);
			this.emailTemplateService.emailTemplateData.next({'Disabled': this.EmailTemplate.TemplateDetailGetAllDto.Disabled, 'RuleCode': this.EmailTemplate.TemplateMasterGetAllDto.Code, 'Id': this.EmailTemplate.TemplateMasterGetAllDto.Id});
			this.getDynamicFields(this.EmailTemplate.TemplateMasterGetAllDto.XrmEntityId, this.EmailTemplate.SectorId );
			this.patchForm(this.EmailTemplate);
			this.getRecipientDetails(this.EmailTemplate);
			this.getEmailSentData(this.EmailTemplate.TemplateRecipientGetAllDtos);
			this.getFooterData();
			this.emailTemplateGridData = this.EmailTemplate.TemplateAttachmentGetAllDto;
			this.templateId= this.EmailTemplate.TemplateDetailGetAllDto.Id;
			this.staticAttachmentData = [];
			this.dynamicAttachmentData = [];
			this.rebindAttachmentGridData();
			this.loadLanguagesByCountry(res.Data.Data.CountryId);
			this.cdr.markForCheck();

		});
	}

	private loadLanguagesByCountry(countryId: string): void {
		this.configureClientService.getLanguageByCountry(countryId)
			.pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((response: GenericResponseBase<dropdownModel[]>) => {
				this.languageDropDownList = response.Data ?? [];
				this.EditEmailConfigurationForm.controls['Language'].patchValue({
					Text: this.EmailTemplate.TemplateDetailGetAllDto.CultureName,
					Value: this.EmailTemplate.TemplateDetailGetAllDto.CultureId.toString()
				});
			});
	}

	 private patchForm(data: EmailTemplate){

		if(data.TemplateMasterGetAllDto.XrmEntityId === Number(XrmEntities.Users))
			this.isUserTemplate = true;
		else
			this.isUserTemplate = false;

		if(data.SectorId){
			this.EditEmailConfigurationForm.controls['EditTemplateForSector'].patchValue(true);
			this.isSectorVisible = true;
			this.EditEmailConfigurationForm.controls['Sector'].patchValue({Value: data.SectorId.toString()});
			this.EditEmailConfigurationForm.controls['Sector'].addValidators([this.customvalidator.RequiredValidator('PleaseSelectData', [{Value: 'Sector', IsLocalizeKey: true}])]);
			this.EditEmailConfigurationForm.controls['Sector'].updateValueAndValidity();
		}

		this.recordId = data.TemplateMasterGetAllDto.Code;

		this.EditEmailConfigurationForm.controls['Language'].patchValue({Value: data.TemplateDetailGetAllDto.CultureId.toString()});

		this.EditEmailConfigurationForm.controls['editor'].patchValue(null);

		this.patchBodyAndSubject(data);
		this.cdr.markForCheck();
	}

	private patchBodyAndSubject(data: EmailTemplate){

		this.EditEmailConfigurationForm.patchValue({
			Priority: data.TemplateDetailGetAllDto.PriorityId.toString()
		});

		this.previewTemplate= '<table class="email__template-bodyline" cellpadding="0" cellspacing="0" width="100%"><tr><td><table class="inner-table" cellpadding="0" cellspacing="0" width="100%" align="center" border="0"><tr><td>[BodyHtml]</td></tr></table></td></tr><tr><td><table class="email__template-footerline" bgcolor="#eaedfd" cellpadding="0" cellspacing="0" width="100%" align="center" border="0"><tr><td><table width="100%"><tr><td>[FooterHtml]</td></tr></table></td></tr><tr><td class="email__template-copyrightline">[FooterSignature]</td></tr></table></td></tr></table>';

		this.body = data.TemplateDetailGetAllDto.BodyTemplate;

		this.footer = data.HeaderFooterGetAllDto.FooterTemplate;

		this.footerSignature= data.HeaderFooterGetAllDto.FooterSignatureTemplate;

		this.previewTemplate = this.previewTemplate.replace('[BodyHtml]', this.body).replace('[FooterHtml]', this.footer).replace('[FooterSignature]', this.footerSignature);
		this.cdr.markForCheck();
	}

	private getRecipientDetails(data: EmailTemplate){
		this.toRecipients = data.TemplateRecipientGetAllDtos.To;
		this.ccRecipients = data.TemplateRecipientGetAllDtos.Cc;
		this.bccRecipients = data.TemplateRecipientGetAllDtos.Bcc;
		this.cdr.markForCheck();
	}

	private getEmailSentData(data: RecipientDTO){

		this.emailData = [];

		const keys: string[] = Object.keys(data);
		keys.forEach((key: string) => {
			const value = data[key];
			if(value !== null){
				value.forEach((element: Recipient) => {
					this.emailData.push(element);
				});
			}
		});

		this.emailData.forEach((ele: Recipient) => {
			ele.nameForView = (ele.UserTypeName ?? (ele.CustomUserEmail) ?? ele.UserName) ?? ele.RoleGroupName;
		});

		this.BackupList = JSON.stringify(this.emailData);
	}

	private getDynamicFields(id: number, sectorId: number | null){

		forkJoin([
			this.emailTemplateService.getUDFDynamicFields(id, sectorId),
			this.emailTemplateService.getBasicDynamicFields(id)
		]).pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe(([
			UDFDynamicFieldlist,
			BasicDetailsDynamicFieldlist
		]) => {
			this.UDFDynamicFieldlist = UDFDynamicFieldlist.Data;
			this.UDFDynamicFieldlistBackup = UDFDynamicFieldlist.Data;
			this.BasicDetailsDynamicFieldlist = BasicDetailsDynamicFieldlist.Data;
			this.BasicDetailsDynamicFieldlistBackup = BasicDetailsDynamicFieldlist.Data;
			this.AllDynamicFieldList = [...this.AllDynamicFieldList, ...UDFDynamicFieldlist.Data, ...BasicDetailsDynamicFieldlist.Data];
			this.dynamicFieldList = true;
			this.cdr.markForCheck();
		});
	}

	private getFooterData(){
		this.emailTemplateService.getFooterData().pipe(takeUntil(this.destroyAllSubscribtion$))
			.subscribe((res: ApiResponse) => {
				if(res.Data){
					this.footerData = res.Data;
					this.footerData.push({ key: '1310', value: this.recordId });
				}
			});
	}


	public onChangeTemplate(){
		this.attachmentForm.reset();
		this.attachmentForm.patchValue({
			radiobtn: '1'
		});
		this.isSectorVisible = !this.isSectorVisible;

		if(this.isSectorVisible)
		{
			this.EditEmailConfigurationForm.controls['Sector'].addValidators([this.customvalidator.RequiredValidator('PleaseSelectData', [{Value: 'Sector', IsLocalizeKey: true}])]);
		}
		else{
			this.EditEmailConfigurationForm.controls['Sector'].patchValue(null);
			this.EditEmailConfigurationForm.controls['Sector'].clearValidators();
			this.onChangeSector({Text: '', Value: '0'});
		}
		this.EditEmailConfigurationForm.controls['Sector'].updateValueAndValidity();
	}

	onDragStart(event: DragEvent, item: FieldList) {
  	event.dataTransfer?.setData('text/plain', `[${item.LocalizedValue}]`);
		this.EditEmailConfigurationForm.markAsDirty();
	}

	onChangeSector(e: dropdownModel){
		 this.emailTemplateService.getSectorUkey(parseInt(e.Value), this.EmailTemplate.TemplateMasterGetAllDto.Id)
		 .pipe(takeUntil(this.destroyAllSubscribtion$))
		   	.subscribe((res: ApiResponse) => {
				if(res.Data !== null){
					this.bodyPatched = false;
					this.dynamicFieldList = false;
					this.getEmailTemplateById(res.Data?.Ukey);
				}
				this.cdr.markForCheck();
		   	});
	}

	openList(){
		this.dialogRecipient = true;
		this.emailTemplateService.getRecipientUserType().pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe({
			next: (data: ApiResponse) => {
				this.RecipientDropDownList = data.Data;
			}
		});
	}

	onChange(e: dropdownModel){
		this.currentRoleType = e;
		if(e.Value === String(AdditionalRecipients.Role)){
			this.RoleDropdown = true;
			this.UserDropdown = false;
			this.UserTextbox = false;
			this.getRoleDropdown();
		}
		if(e.Value === String(AdditionalRecipients.User)){
			this.RoleDropdown = false;
			this.UserDropdown = true;
			this.UserTextbox = false;
			if(this.UserDropDownList.length <= Number(magicNumber.zero)){
				this.getUserDropdown();
			}
		}
		if(e.Value === String(AdditionalRecipients.CustomEmail)){
			this.RoleDropdown = false;
			this.UserDropdown = false;
			this.UserTextbox = true;
		}
	}

	private getRoleDropdown(){
		this.emailTemplateService.getRolesType().pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: ApiResponse) => {
			this.RoleDropDownList = res.Data;

		});
	}

	private getUserDropdown(){
		this.emailTemplateService.getActiveUser().pipe(takeUntil(this.destroyAllSubscribtion$)).subscribe((res: ApiResponse) => {
			this.UserDropDownList = res.Data;

		});
	}

	public onDecline() {
		if(this.BackupList){
			this.emailData = JSON.parse(this.BackupList.toString());
		}

		this.closeDialog();
		this.RoleDropdown = false;
		this.UserDropdown = false;
		this.UserTextbox = false;
		this.touched = false;
	}

	getRecipientNames(recipients: Recipient[]): string {
		return recipients.map((rec: Recipient) => {
			if(rec.UserTypeName){
				return rec.UserTypeName;
			}
			if(rec.CustomUserEmail){
				return rec.CustomUserEmail;
			}
			else if(rec.UserName){
				return rec.UserName;
			}
			else if(rec.RoleGroupName){
				return rec.RoleGroupName;
			}
			else{
				return rec.RecipientTypeName;
			}
		}).join(', ');
	}

	onRadio(index: number, column: string, value: string){

		this.touched = true;

		this.emailData[index].To = false;
		this.emailData[index].Cc = false;
		this.emailData[index].Bcc = false;
		this.emailData[index].None = false;

		if(value === 'on')
		{
			if(column == 'To')
				this.emailData[index].To = true;
			if(column == 'Cc')
				this.emailData[index].Cc = true;
			if(column == 'Bcc')
				this.emailData[index].Bcc = true;
			if(column == 'None')
				this.emailData[index].None = true;
		}
	}

	AddToList(){
		let check: boolean = false;

		if(this.RoleDropdown && this.Role.value.Text !== undefined){
			check = this.doesExistUser(this.Role.value.Text);
			if(!check){
				this.emailData.push({
					nameForView: this.Role.value.Text,
					To: true, Cc: false, Bcc: false, None: false,
					UserTypeName: this.Role.value.Text,
					TemplateDetailId: this.EmailTemplate.TemplateDetailGetAllDto.Id,
					RecipientTypeId: parseInt(this.currentRoleType.Value),
					RecipientTypeName: this.currentRoleType.Text,
					RoleGroupId: parseInt(this.Role.value.Value),
					RoleNo: parseInt(this.Role.value.Value)
				});
				this.emptyRecipient();
			}
		}
		if(this.UserDropdown && this.User.value.Text !== undefined){
			check = this.doesExistUser(this.User.value.Text);
			if(!check){
				this.emailData.push({
					nameForView: this.User.value.Text,
					To: true, Cc: false, Bcc: false, None: false,
					UserTypeName: this.User.value.Text,
					TemplateDetailId: this.EmailTemplate.TemplateDetailGetAllDto.Id,
					RecipientTypeId: parseInt(this.currentRoleType.Value),
					RecipientTypeName: this.currentRoleType.Text,
					UserNo: this.User.value.Value
				});
				this.emptyRecipient();
			}
		}
		if(this.UserTextbox && this.listForm.controls['Email'].value !== null && this.listForm.controls['Email'].valid){
			check = this.doesExistUser(this.listForm.controls['Email'].value.trim());
			if(!check){
				this.emailData.push({
					nameForView: this.listForm.controls['Email'].value.trim(),
					To: true, Cc: false, Bcc: false, None: false,
					UserTypeName: this.listForm.controls['Email'].value,
					TemplateDetailId: this.EmailTemplate.TemplateDetailGetAllDto.Id,
					RecipientTypeId: parseInt(this.currentRoleType.Value),
					RecipientTypeName: this.currentRoleType.Text,
      				CustomUserEmail: this.listForm.controls['Email'].value
				});
				this.emptyRecipient();
			}
		}
	}

	private emptyRecipient(){

		this.touched = true;
		this.listForm.controls['Email'].patchValue(null);
		this.Role.value = {};
		this.User.value = null;
	}

	private doesExistUser(e: string){
		e = e.toLowerCase().trim();
		return this.emailData.some((element: Recipient) => {
			const ele = element.nameForView?.toString().toLowerCase().trim();
			return ele === e;
		});
	}

	public onAccept() {

		this.toRecipients = this.emailData.filter((x: Recipient) =>
			x.To);

		this.ccRecipients = this.emailData.filter((x: Recipient) =>
			x.Cc);

		this.bccRecipients = this.emailData.filter((x: Recipient) =>
			x.Bcc);

		this.BackupList = JSON.stringify(this.emailData);
		this.closeDialog();
		this.RoleDropdown = false;
		this.UserDropdown = false;
		this.UserTextbox = false;
		this.touched = false;
		this.EditEmailConfigurationForm.markAsDirty();
	}

	private nameToId(value: string) {
		 const draggables = value.split('[');
		 for(const a of this.AllDynamicFieldList){
			for(const ele of draggables){
				const element = ele.substring(magicNumber.zero, ele.lastIndexOf(']'));
				if(a.LocalizedValue === element)
				{
					value = value.replace(`[${element}]`, `[${a.Id}]`);
				}
			};
		}

		return value;
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


	private changeFooter(){
		const draggables = this.previewTemplate.split('[');
		draggables.forEach((element: string) => {
			this.footerData.forEach((ele: {key: string, value: string}) => {
				if(ele.key === element.substring(magicNumber.zero, element.lastIndexOf(']'))){
					this.previewTemplate =
					this.previewTemplate.replace(`[${ele.key}]`, ele.value);
				}
			});
		});

		this.previewTemplate= this.previewTemplate.replaceAll('<a', '<span');
		this.previewTemplate = this.previewTemplate.replaceAll('/a>', '/span>');
	}

	searchCustom(e: string){
		if(e !== ''){

			if(e.indexOf('[') === Number(magicNumber.zero)){
				e = e.substring(magicNumber.one, e.length);
			}
			if(e.lastIndexOf(']') === (e.length - magicNumber.one)){
				e = e.substring(magicNumber.zero, e.length - magicNumber.one);
			}

			const expansions: HTMLCollectionOf<HTMLElement> = document.getElementsByTagName('kendo-expansionpanel') as HTMLCollectionOf<HTMLElement>,
				arr = Array.from(expansions);

			for (const i of arr) {
				const header = i.children[0] as HTMLElement;
				if(header.ariaExpanded == "false" || !header.ariaExpanded){
					header.click();
				}
			}

			// UDF Fields
			if(this.UDFDynamicFieldlist.length > Number(magicNumber.zero)){
				this.UDFDynamicFieldlist = [];
				this.UDFDynamicFieldlistBackup.forEach((element: FieldList) => {
					const ele = element.LocalizedValue?.toLowerCase().trim();
					if(ele?.includes(e))
						this.UDFDynamicFieldlist.push(element);
				});
			}

			// Basic Details Fields
			if(this.BasicDetailsDynamicFieldlist.length > Number(magicNumber.zero)){
				this.BasicDetailsDynamicFieldlist = [];
				this.BasicDetailsDynamicFieldlistBackup.forEach((element: FieldList) => {
					const ele = element.LocalizedValue?.toLowerCase().trim();
					if(ele?.includes(e))
						this.BasicDetailsDynamicFieldlist.push(element);
				});
			}
		}
		else{
			this.BasicDetailsDynamicFieldlist = this.BasicDetailsDynamicFieldlistBackup;
			this.UDFDynamicFieldlist = this.UDFDynamicFieldlistBackup;
		}
	}

	search(e: string){
		if(e !== ''){
			e = e.toLowerCase().trim();
			if(e.indexOf('[') === Number(magicNumber.zero)){
				e = e.substring(magicNumber.one, e.length);
			}
			if(e.lastIndexOf(']') === (e.length - magicNumber.one)){
				e = e.substring(magicNumber.zero, e.length - magicNumber.one);
			}
			this.ConfigurableDynamicFieldlist = [];
			this.ConfigurableDynamicFieldlistBackup.forEach((element: FieldList) => {
				const ele = element.LocalizedValue?.toLowerCase().trim();
				if(ele?.includes(e))
					this.ConfigurableDynamicFieldlist.push(element);
			});
		}
		else{
			this.ConfigurableDynamicFieldlist = this.ConfigurableDynamicFieldlistBackup;
		}
	}

	OnEnterPressCustom(e: KeyboardEvent, value: string){
		if (e.key == 'Enter') {
			this.searchCustom(value);
		}
	}

	OnEnterPress(e:KeyboardEvent, value: string){
		if (e.key == 'Enter') {
			this.search(value);
		}
	}

	searchValueChange(e: string){
		if(e == ''){
			this.ConfigurableDynamicFieldlist = this.ConfigurableDynamicFieldlistBackup;
		}
	}

	searchValueChangeCustom(e: string){
		if(e == ''){
			this.BasicDetailsDynamicFieldlist = this.BasicDetailsDynamicFieldlistBackup;
			this.UDFDynamicFieldlist = this.UDFDynamicFieldlistBackup;
		}
	}

	cancel(){
		this.route.navigate([NavigationPaths.list]);
	}

	private changesubject(){
		const clientName = this.ConfigurableDynamicFieldlist.findIndex((element: FieldList) => {
				return element.LocalizedKey === 'ClientName';
			}),
			subject = this.nameToId(this.EditEmailConfigurationForm.controls['SubjectName'].value);

		return `[${parseInt(this.ConfigurableDynamicFieldlist[clientName].Id.toString())}] - ${subject}`;

	}

	submitForm() {
		this.EditEmailConfigurationForm.markAllAsTouched();
		if (this.EditEmailConfigurationForm.valid) {
			const payload = this.generatePayload();
			this.updateEmailTemplate(payload);
			this.EditEmailConfigurationForm.markAsPristine();
		}
	}

	private generatePayload(){

		this.emailData.forEach((ele: Recipient) => {
			ele.TemplateDetailId = this.EmailTemplate.TemplateDetailGetAllDto.Id;
		});
		const body = this.nameToId(this.EditEmailConfigurationForm.controls['editor'].value),
			subject = this.changesubject(),
			payload = {
		   	SectorId: this.EditEmailConfigurationForm.controls['Sector'].value?.Value??null,
		   	TemplateMasterUpdateDto: {
		   		Ukey: this.EmailTemplate.TemplateMasterGetAllDto.Ukey,
		   		TemplateName: this.EmailTemplate.TemplateMasterGetAllDto.TemplateName
		   	},
		   	TemplateDetailUpdateDto: {
		   		CultureId: this.EditEmailConfigurationForm.controls['Language'].value.Value,
		   		PriorityId: this.EditEmailConfigurationForm.controls['Priority'].value,
		   		Ukey: this.EmailTemplate.TemplateDetailGetAllDto.Ukey,
		   		TemplateDetailId: this.EmailTemplate.TemplateDetailGetAllDto.Id,
		   		Subject: subject.trim(),
		   		Body: `${body}`
		   	},
		   	TemplateRecipientUpdateDtos: this.emailData,
		   	SystemDocumentAddDto: this.staticAttachmentData,
				DynamicAttachmentAddDto: this.dynamicAttachmentData
		   };

		return payload;
	}

	private updateEmailTemplate(payload: EmailTemplatePayload){

		this.emailTemplateService.updateEmailTemplate(payload).pipe(takeUntil(this.destroyAllSubscribtion$)).
			subscribe((res: ApiResponse) => {
				if(res.Succeeded){
					this.toasterServc.showToaster(ToastOptions.Success, 'EmailConfigurationHasBeenSavedSuccessfully');
					this.commonService.resetAdvDropdown(this.entityId);
					if(res.Data){
						this.route.navigate([`${NavigationPaths.addEdit}${res.Data}`]);
					}
				}
				else{
					this.toasterServc.showToaster(ToastOptions.Error, res.Message ?? '');
				}
				window.scrollTo({ top: 0, behavior: 'smooth' });
			});
	}

	openPreview(){

		this.body = this.EditEmailConfigurationForm.controls['editor'].value;
		this.previewTemplate= '<table class="email__template-bodyline" cellpadding="0" cellspacing="0" width="100%"><tr><td><table class="inner-table" cellpadding="0" cellspacing="0" width="100%" align="center" border="0"><tr><td>[BodyHtml]</td></tr></table></td></tr><tr><td><table class="email__template-footerline" bgcolor="#eaedfd" cellpadding="0" cellspacing="0" width="100%" align="center" border="0"><tr><td><table width="100%"><tr><td>[FooterHtml]</td></tr></table></td></tr><tr><td class="email__template-copyrightline">[FooterSignature]</td></tr></table></td></tr></table>';
		this.previewTemplate = this.previewTemplate.replace('[BodyHtml]', this.body).replace('[FooterHtml]', this.footer).replace('[FooterSignature]', this.footerSignature);

		this.changeFooter();
		this.previewDialogOpen = true;
	}

	public onPreviewAccept() {
		this.previewDialogOpen = false;
	}

	public closeDialog() {
		this.dialogRecipient = false;
	}

	public downloadRecords(dataitem: AttachmentsDTO){
		this.emailTemplateService.downloadRecords(dataitem.DocumentManagemenstSystemId ?? magicNumber.zero)
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
		}else if(extension === 'txt'){
			return 'assets/images/txt.png';
		}else if(extension === 'xlsx'){
			return '';
		}else if(extension === 'xls'){
			return '';
		}else{
			return '';
		}
	}

	onAttachmentTypeChange(selectedValue: string) {
		this.attachmentForm.get('radiobtn')?.setValue(selectedValue);
		this.timeoutId = window.setTimeout(() => {
		  if (selectedValue === '1') {
				this.attachmentForm.get('DocumentTitleDrp')?.reset();
		  } else if (selectedValue === '2') {
				this.attachmentForm.get('DocumentTitle')?.reset();
		  }
		  this.attachmentForm.get('DocumentFileName')?.reset();
		  this.cdr.detectChanges();
		}, magicNumber.zero);
	  }


	public onFileSelect(event: SelectEvent) {
		this.EditEmailConfigurationForm.markAsDirty();
		const filedata = event.files;
		this.uploadFileData(filedata);
	}

	private uploadFileData(selectedFile: FileInfo[]) {
		this.toasterServc.resetToaster();
		const data = selectedFile[0],
		 formData = this.prepareFormData(data),
		  type = this.attachmentForm.get('radiobtn')?.value,
		 documentTitleValue = this.attachmentForm.get('DocumentTitle')?.value;

		if (!formData) {
			return;
		}

		if (type == magicNumber.one) {
			this.emailTemplateService.addTemplateStaticAttachment(formData)
				.pipe(takeUntil(this.destroyAllSubscribtion$))
				.subscribe((res: GenericResponseBase<GenericResponseBase<FileUploadDetails>>) => {
					this.handleFileUploadResponse(res, documentTitleValue);
				});
		}
	}

	private prepareFormData(fileData: FileInfo): FormData | null {
		const record = fileData,
		 formData = new FormData(),
		 allowedExtensions = ['pdf', 'doc', 'xlsx', 'txt', 'xls', 'docx'],
		 fileExtension = (record.extension ?? '').replace('.', '');

		if (!allowedExtensions.includes(fileExtension)) {
			this.toasterServc.displayToaster(ToastOptions.Error, 'Upload .doc, .pdf, .xls, .txt, .xlsx, .docx files only.');
			return null;
		}

		formData.append('fileExtension', fileExtension);
		formData.append('fileNameWithExtension', record.name);
		formData.append('fileSize', (record.size ?? magicNumber.zero).toString());
		formData.append('contentType', record.rawFile?.type ?? '');
		formData.append('file', record.rawFile ?? '');
		formData.append('fileName', record.name.substring(magicNumber.zero, record.name.lastIndexOf('.')));
		formData.append('encryptedFileName', record.uid ?? '');

		return formData;
	}


	private handleFileUploadResponse(res: GenericResponseBase<GenericResponseBase<FileUploadDetails>>, documentTitleValue: string) {
		if (res.Succeeded && res.Data && res.Data.Data) {
			const dmsFiledRecord = {
				id: magicNumber.zero,
				statusId: magicNumber.one,
				DocumentTitleValue: documentTitleValue,
				Attachment: res.Data.Data.FileNameWithExtension,
				DocumentType: 'Static',
				FileName: res.Data.Data.FileName,
				FileExtension: res.Data.Data.FileExtension.replace('.', ''),
				FileNameWithExtension: res.Data.Data.FileNameWithExtension,
				EncryptedFileName: res.Data.Data.EncryptedFileName,
				DocumentConfigurationName: ' '
			};

			this.emailTemplateGridData.push(dmsFiledRecord);
			this.staticAttachmentData.push({
				DocumentFile: res.Data.Data.EncryptedFileName,
				DocumentName: res.Data.Data.FileName,
				DocumentTitle: this.attachmentForm.get('DocumentTitle')?.value,
				DocumentType: res.Data.Data.FileExtension.replace('.', ''),
				DocumentSize: res.Data.Data.FileSize,
				DocumentExtension: res.Data.Data.FileExtension.replace('.', ''),
				IsDisabled: false,
				DocumentManagementSystemId: null
			});
			this.fileSize = res.Data.Data.FileSize;
			this.attachmentForm.patchValue({ 'DmsFieldRecord': dmsFiledRecord });
			this.cdr.markForCheck();
		} else {
			this.toasterServc.displayToaster(ToastOptions.Error, 'VirusDetected');
		}
	}

	  public onAddButtonClick() {
		const selectedValue = this.attachmentForm.get('DocumentTitleDrp')?.value,
			selectedText = selectedValue?.Text,
			documentConfigurationId = parseInt(selectedValue?.Value, 10),
			documentExistsInList = this.DocumentDrpList??[].some((item: dropdownWithExtras) =>
				item.Value === selectedValue?.Value && item.Text === selectedText),
			documentExists = this.dynamicAttachmentData.some((item: DynamicAttachmentDTO) =>
				item.DocumentConfigurationId === documentConfigurationId);

		this.attachmentForm.get('DocumentTitleDrp')?.markAsDirty();
		if (!selectedValue || this.attachmentForm.get('DocumentTitleDrp')?.value==null) {
			this.attachmentForm.get('DocumentTitleDrp')?.setErrors({
				message: 'PleaseSelectDocumentTitle'
			});
			return;
		}

		if (!documentExistsInList) {
			return;
		}

		if (!documentExists) {
			const dynamicRecord = {
				"DocumentTitleValue": selectedText,
				"Attachment": ' ',
				"DocumentType": 'Dynamic'
			};

			this.emailTemplateGridData.push(dynamicRecord);
			this.dynamicAttachmentData.push({
				TemplateDetailId: this.templateId,
				DocumentConfigurationId: documentConfigurationId,
				Disabled: false
			});
			this.attachmentForm.get('DocumentTitleDrp')?.setValue(null);
			this.EditEmailConfigurationForm.markAsDirty();
		}
		else{
			this.attachmentForm.get('DocumentTitleDrp')?.setErrors({
				message: 'ThisDocumentTitleAlreadyExists'
			});
		}

	}


	clearFile(dataItem: AttachmentsDTO) {

		this.EditEmailConfigurationForm.markAsDirty();
	 	const index = this.emailTemplateGridData.findIndex((item) =>
	   		item === dataItem);

		this.emailTemplateGridData.splice(index, magicNumber.one);

	 	if (dataItem.DocumentType === 'Static' && dataItem.DocumentManagemenstSystemId!==undefined) {
	   		const staticIndex = this.staticAttachmentData.findIndex((item) =>
	   			item.DocumentManagementSystemId === dataItem.DocumentManagemenstSystemId);
	   		this.staticAttachmentData[staticIndex].IsDisabled = true;
	   	}
		else if(dataItem.DocumentType === 'Static' && dataItem.DocumentManagemenstSystemId ==undefined){
			this.staticAttachmentData = [];
			this.rebindAttachmentGridData();
		} else if(dataItem.DocumentType === 'Dynamic' && dataItem.DocumentConfigurationId !==undefined){
			const dynamicIndex = this.dynamicAttachmentData.findIndex((item) =>
	   			item.DocumentConfigurationId === dataItem.DocumentConfigurationId);
	   		this.dynamicAttachmentData[dynamicIndex].Disabled = true;
	   	}
		else{
			this.dynamicAttachmentData = [];
			this.rebindAttachmentGridData();

		}

	 }

	private rebindAttachmentGridData(){
		for (const key in this.emailTemplateGridData) {
			if (this.emailTemplateGridData[key].DocumentType === 'Static') {

				this.staticAttachmentData.push({
					DocumentName: this.emailTemplateGridData[key].DocumentName ?? '',
					DocumentType: this.emailTemplateGridData[key].DocumentExtension ?? '',
					DocumentTitle: this.emailTemplateGridData[key].DocumentConfigurationName?.toString() ?? '',
					DocumentSize: this.fileSize,
					DocumentManagementSystemId: this.emailTemplateGridData[key].DocumentManagemenstSystemId ?? magicNumber.zero,
					IsDisabled: this.emailTemplateGridData[key].Disabled ?? false,
					UKey: this.emailTemplateGridData[key].Ukey
				});
			}
			else{
				this.dynamicAttachmentData.push({
					TemplateDetailId: this.templateId,
					DocumentConfigurationId: this.emailTemplateGridData[key].DocumentConfigurationId ?? magicNumber.zero,
					Disabled: this.emailTemplateGridData[key].Disabled ?? false,
					UKey: this.emailTemplateGridData[key].Ukey
				});
			}
		}

	}

	onDrop(event: DragEvent) {
		event.preventDefault();
		const text = event.dataTransfer?.getData('text/plain');
		if (text) {
			const textBox = event.target as HTMLInputElement,
			 	cursorPosition = textBox.selectionStart??magicNumber.zero,
				textBeforeCursor = textBox.value.substring(magicNumber.zero, cursorPosition),
				textAfterCursor = textBox.value.substring(cursorPosition);
			textBox.value = textBeforeCursor + text + textAfterCursor;
		}
	}

	ngOnDestroy(): void {
		this.EditEmailConfigurationForm.markAllAsTouched();
		if (this.timeoutId !== undefined) {
			clearTimeout(this.timeoutId);
		  }
		this.toasterServc.resetToaster();
		this.destroyAllSubscribtion$.next();
		this.destroyAllSubscribtion$.complete();
	}
}
