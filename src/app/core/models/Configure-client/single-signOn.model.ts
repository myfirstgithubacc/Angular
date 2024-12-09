
export interface SingleSignOnData {
	UserType: string;
	LoginCredential: string | string[];
	IsDefault: boolean;
  }

export interface SingleSignOn {
	Data: SingleSignOnData[];
  }
