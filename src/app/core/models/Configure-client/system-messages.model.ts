export interface SystemMessage {
  Data: DataObject[];
}

export interface DataObject {
  id: number;
  localizedKey: string;
  message: string;
}

// Converts JSON strings to/from your types
export class Convert {
	public static toWelcome(json: string): SystemMessage {
		return JSON.parse(json);
	}

	public static welcomeToJson(value: SystemMessage): string {
		return JSON.stringify(value);
	}
}

export interface SystemMessageDataToUpdate {
  systemMessageList : DataObject[];
  reasonForChange : string
}
export interface SupportDetails {
  contactNumber: string;
  email: string;
}

