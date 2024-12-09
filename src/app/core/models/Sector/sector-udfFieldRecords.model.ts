import { CommonSection } from "@xrm-master/sector/common/CommonSectionModel";
import { IPreparedUdfPayloadData } from "@xrm-shared/common-components/udf-implementation/Interface/udf-common.model";

export class SectorUdfFieldRecords extends CommonSection {
	UdfFieldRecords: IPreparedUdfPayloadData[];
	constructor(init?: Partial<SectorUdfFieldRecords>) {
		super();
		Object.assign(this, init);
	}
}
