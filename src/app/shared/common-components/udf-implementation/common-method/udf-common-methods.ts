import { Injectable } from "@angular/core";
import { XrmEntities } from "@xrm-shared/services/common-constants/XrmEntities.enum";
import { IParentsInfos } from "../Interface/udf-common.model";

@Injectable({
	providedIn: 'root'
})

export class UdfCommonMethods {

	public parentsInfos: IParentsInfos[] = [];

	public manageParentsInfo(parentXrmEntityId: XrmEntities, parentRecordId: null | undefined | number) {
		let isUpdated = false;

		if (parentRecordId == null && parentRecordId == undefined) {
			let data: IParentsInfos[] = [];
			this.parentsInfos.forEach((item: IParentsInfos) => {
				if (item.parentXrmEntityId != Number(parentXrmEntityId)) {
					data = [item];
				}
			});

			this.parentsInfos = data;
			return;
		}

		this.parentsInfos.forEach((x) => {
			if (x.parentXrmEntityId == Number(parentXrmEntityId)) {
				x.parentRecordId = parentRecordId;
				isUpdated = true;
			}
		});

		if (!isUpdated) {
			this.parentsInfos = [...this.parentsInfos, { parentXrmEntityId: parentXrmEntityId, parentRecordId: parentRecordId }];
		}
	}

	public getParentsInfo() {
		return this.parentsInfos;
	}

}
