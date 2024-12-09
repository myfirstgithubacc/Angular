export interface IStepper{
    
    disabled?: boolean; 
    optional?: boolean; 
    length?: number;
    label: string;
  isValid: (index: number) => boolean;
  validate: () => boolean;
}

