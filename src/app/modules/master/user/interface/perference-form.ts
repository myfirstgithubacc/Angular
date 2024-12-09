import { FormGroup } from "@angular/forms";
import { PreferenceComponent } from "../add-edit/preference/preference.component";

export interface IPerferenceForm {
  formGroup: FormGroup;
  context: PreferenceComponent;
}

