import { magicNumber } from "@xrm-shared/services/common-constants/magic-number.enum";

export enum RevisionStatus {
  pendingForApproval = magicNumber.oneHundredEightyEight,
  approved = magicNumber.oneHundredEightyNine,
  declined = magicNumber.oneHundredNinety,
  withdraw = magicNumber.twoHundredSix,
  pendingForMspProcess = magicNumber.twoHundredSeven,
  processed = magicNumber.twoHundredFour,
  mspDeclined = magicNumber.twoHundredFive,
  autoApproved = magicNumber.twoHundredEight,
}
