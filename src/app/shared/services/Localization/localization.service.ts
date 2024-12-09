/* eslint-disable multiline-ternary */
/* eslint-disable no-loop-func */
import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DynamicParam } from './DynamicParam.interface';
import { MaskFormatPipe } from '@xrm-shared/pipes/mask-format.pipe';
import { CultureFormat } from './culture-format.enum';
import { environment } from 'src/environments/environment';
import { ZipCodeFormat } from './zip-code-format.enum';
import { magicNumber } from '../common-constants/magic-number.enum';
import { Subject, takeUntil } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class LocalizationService {

	private data = null;
	private unsubscribe$ = new Subject<void>();
	// eslint-disable-next-line max-params
	constructor(
		private http: HttpClient,
		private translateSrv: TranslateService,
		private datePipe: DatePipe,
		private maskFormatPipe: MaskFormatPipe
	) {
	}

	// set default language
	public setDefaultLanguage() {
        const language = sessionStorage.getItem(CultureFormat[CultureFormat.ClientCultureCode]) ?? 'en-US'
        this.translateSrv.setDefaultLang(language);
        this.translateSrv.use(language);
    }

	// this method is used to change culture
	public ChangeCulture(cultureCode: any) {
		this.translateSrv.use(cultureCode);
	}

	// this method is used to refresh localization file
	public Refresh(time: number = Number(magicNumber.oneThousand)) {
		sessionStorage.setItem(CultureFormat[CultureFormat.IsJsonFileRefreshed], '1');
		this.RefreshFile(time);
	}

	public RefreshFile(time: number = Number(magicNumber.oneThousand)) {
		setTimeout(() => {
			const code = sessionStorage.getItem(CultureFormat[CultureFormat.ClientCultureCode]) ?? '';
			this.translateSrv.reloadLang(code);
		}, time);
	}

	// it call on login time to manage culture info
	public ManageCultureInfo(loginResponse: any) {
		loginResponse.DateFormat = loginResponse.DateFormat ?? 'M/d/yyyy';
		loginResponse.TimeFormat = loginResponse.TimeFormat ?? 'hh:mm:ss aa';
		sessionStorage.setItem(CultureFormat[CultureFormat.UserFullName], loginResponse.UserFullName);
		sessionStorage.setItem(CultureFormat[CultureFormat.DateFormat], loginResponse.DateFormat);
		sessionStorage.setItem(CultureFormat[CultureFormat.TimeFormat], loginResponse.TimeFormat);
		sessionStorage.setItem(CultureFormat[CultureFormat.DateTimeFormat], `${loginResponse.DateFormat} ${loginResponse.TimeFormat}`);
		sessionStorage.setItem(CultureFormat[CultureFormat.DecimalPlaces], '2');
		sessionStorage.setItem(CultureFormat[CultureFormat.CountryId], loginResponse.CountryId ?? '1');
		// RoleGroupId
		sessionStorage.setItem(CultureFormat[CultureFormat.RoleGroupId], loginResponse.RoleGroupId);
		sessionStorage.setItem(CultureFormat[CultureFormat.OffSetValue], loginResponse.OffSetMinutes);

		// to get refreshed data from country json
		this.manageCountryJson();
	}

	public manageCountryJson() {
		const cacheBuster = new Date().getTime(),
			path = `${environment.LocalizationBasePath}${this.GetCulture(CultureFormat.ClientName)}/CultureInfo/CountryInfo.json`,
			params = new HttpParams().set('cacheBuster', cacheBuster.toString());
		this.http.get(path, { params }).pipe(takeUntil(this.unsubscribe$))
			.subscribe((res: any) => {
				sessionStorage.setItem(CultureFormat[CultureFormat.Country], JSON.stringify(res));
			});
	}

	// it return localize value based on localize key
	public GetLocalizeMessage(fieldKey: any, paramArray: DynamicParam[] = []): string {
		if (!fieldKey)
			return fieldKey;

		let message = '';
		const object = this.GetParamObject(paramArray);
		this.translateSrv.stream(fieldKey, object).pipe(takeUntil(this.unsubscribe$))
			.subscribe((res: string) => {
				message = res;
			});

		return (message.length == Number(magicNumber.zero))
			? fieldKey
			: message;
	}

	// it return object for dynamic localize key
	public GetParamObject(paramsArray: DynamicParam[]): any {
		if (paramsArray.length == Number(magicNumber.zero))
			return null;

		const result: any = {};

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		let i = 0;
		for (const ele of paramsArray) {
			if (!ele.Value || ele.Value == '')
				continue;

			i++;
			if (!ele.IsLocalizeKey) {
				result[`placeholder${i}`] = ele.Value;
				continue;
			}

			// eslint-disable-next-line no-loop-func
			this.translateSrv.stream(ele.Value).pipe(takeUntil(this.unsubscribe$))
				.subscribe((res: string) => {
					result[`placeholder${i}`] = res;
				});

		}

		return result;
	}

	// it retun culture base on key or culture
	public GetCulture(cultureFormat: CultureFormat, countryId: any = null): any {
		let data: any = null;
		if (countryId == null) {
			if (cultureFormat == CultureFormat.DatePlaceholder) {
				const dateFormat = sessionStorage.getItem(CultureFormat[CultureFormat.DateFormat]);
				if (dateFormat == null)
					return null;

				return this.getDateFormatForPlaceholder(dateFormat);
			}

			data = sessionStorage.getItem(CultureFormat[cultureFormat]);
			return data ?? null;
		}

		data = sessionStorage.getItem(CultureFormat[CultureFormat.Country]);
		if (data == null || data == undefined)
			return null;

		const countryData = JSON.parse(data),
			requestedPropertyName = CultureFormat[cultureFormat],

			result = countryData.find((x: any) =>
				x.CountryId == countryId);
		if (result == null || result == undefined)
			return null;

		return result[requestedPropertyName];
	}

	public TransformToDate(value: any): Date {
		const forwordslace = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/(\d{4})$/.test(value),
			withdot = /^(0?[1-9]|[12][0-9]|3[01])\.(0?[1-9]|1[0-2])\.(\d{4})$/.test(value),
			withminus = /^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[0-2])-(\d{4})$/.test(value);
		if (forwordslace) {
			const [month, day, year] = value.split("/").map(Number);
			return new Date(year, month - 1, day);
		}else if (withdot) {
			const [month, day, year] = value.split(".").map(Number);
			return new Date(year, month - 1, day);
		} else if (withminus) {
			const [month, day, year] = value.split("-").map(Number);
			return new Date(year, month - 1, day);
		} else {
			return new Date(value);
		}
	}

	// it trasnformed culture data base on key or culture
	// eslint-disable-next-line max-params, max-len
	public TransformData(value: any, cultureFormat: CultureFormat, countryId: any = null, timeFormat: any = null, decimalPlaces: number = 0): any {
		if (!value)
			return value;
		if (cultureFormat == CultureFormat.DateFormat || cultureFormat == CultureFormat.DateTimeFormat) {
			const isValidDate = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/(\d{4})$/.test(value),
				ddMmYyyyRegex = /^(0?[1-9]|[12][0-9]|3[01])\.(0?[1-9]|1[0-2])\.(\d{4})$/.test(value);

			if (isValidDate) {
				const date1 = value.split('/');
				return this.datePipe.transform(`${date1[1]}/${date1[0]}/${date1[2]}`, this.GetCulture(cultureFormat));
			} else if (ddMmYyyyRegex) {
				const date1 = value.split('.');
				return this.datePipe.transform(`${date1[1]}/${date1[0]}/${date1[2]}`, this.GetCulture(cultureFormat));
			}
			return this.datePipe.transform(value, this.GetCulture(cultureFormat));
		}

		if (cultureFormat == CultureFormat.TimeFormat) {
			if (!Date.parse(value)) {
				value = this.convertTime(value);
			}

			if (timeFormat == null)
				return this.datePipe.transform(value, this.GetCulture(cultureFormat));
			else
				return this.datePipe.transform(value, timeFormat);
		}

		if (cultureFormat == CultureFormat.Number)
			return this.TransformNumber(value, decimalPlaces, countryId);

		if (cultureFormat == CultureFormat.PhoneFormat) {
			const phoneMask = this.GetCulture(cultureFormat, countryId),
				result = this.maskFormatPipe.transform(value, phoneMask);
			return result;
		}

		return null;
	}
	// it transform number
	// eslint-disable-next-line max-params
	public TransformNumber(number: any, minDecimalPlaces: number, countryId: any = null, maxDecimalPlaces: number = Number(magicNumber.five)) {
		if (!number && number != Number(magicNumber.zero))
			return number;

		if (isNaN(number))
			return number;

		number = Number(number);
		if (!countryId)
			countryId = this.GetCulture(CultureFormat.CountryId);

		const cultureCode = this.GetCulture(CultureFormat.CountryCode, countryId);

		return number.toLocaleString(cultureCode, { minimumFractionDigits: minDecimalPlaces, maximumFractionDigits: maxDecimalPlaces });
	}

	public GetZipMasking(zipCodeFormat: string, zipCodeLength: number): string {
		let mask: string = '';

		for (let index = 0; index < zipCodeLength; index++) {
			if (zipCodeFormat == ZipCodeFormat[ZipCodeFormat.AN]) {
				mask = `${mask}A`;
			}
			else if (zipCodeFormat == ZipCodeFormat[ZipCodeFormat.NU]) {
				mask = `${mask}0`;
			}
		}
		return mask;
	}

	public GetDateFormat(): any {
		return this.GetCulture(CultureFormat.DateFormat);
	}

	public GetTimeFormat(): string {
		return this.GetCulture(CultureFormat.TimeFormat);
	}

	public GetDate(initialDate: Date | string | null = null): Date {
		if (initialDate)
			return new Date(initialDate);

		return new Date();
	}


	public TransformDate(date: any, dateFormat: any = null) {
		if (!dateFormat)
			return this.TransformData(date, CultureFormat.DateFormat);

		return this.datePipe.transform(date, dateFormat);
	}

	public TransformTime(time: any) {
		return this.TransformData(time, CultureFormat.TimeFormat);
	}

	public TransformDateTime(dateTime: any) {
		if (dateTime == undefined || dateTime == null || dateTime.length == Number(magicNumber.zero))
			return dateTime;

		const dateTimeFormate = `${this.GetCulture(CultureFormat.DateFormat)} ${this.GetCulture(CultureFormat.TimeFormat)}`;
		return this.datePipe.transform(dateTime, dateTimeFormate);
	}

	private getDateFormatForPlaceholder(value: string) {
		return {
			year: 'YYYY',
			month: 'MM',
			day: 'DD',
			hour: 'HH',
			minute: 'MM',
			second: 'S'
		};
	}

	public getLocalizationMessageInLowerCase(params: DynamicParam[]): DynamicParam[] {
		return params.map((param) =>
		({
			...param,
			Value: this.GetLocalizeMessage(param.Value).toLowerCase()
		}));
	}


	public convertTime(time: string): Date {
		return new Date(`'06/12/2023' ${time}`);
	}


	ngOnDestroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
