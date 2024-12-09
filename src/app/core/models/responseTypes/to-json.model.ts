export abstract class ToJson {
	public toJson(): any {
		return JSON.parse(JSON.stringify(this));
	}
}
