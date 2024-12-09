import { ToJson } from "./responseTypes/to-json.model";

export abstract class GenericModel<T>
{
	public UKey?:string | null;
	public CreatedDate?:Date;
	public UpdatedDate?:Date;
	constructor(model?:Partial<T>)
	{
		if(model)
		{
			Object.assign(this, model);
		}
		if(this.CreatedDate)
		{
			this.CreatedDate=new Date(this.CreatedDate);
		}
		if(this.UpdatedDate)
		{
			this.UpdatedDate=new Date(this.UpdatedDate);
		}
	}
	public toJson(): ToJson
	{
		return JSON.parse(JSON.stringify(this));
	}
}

