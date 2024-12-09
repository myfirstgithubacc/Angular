import { ElementRef } from "@angular/core";
import { SECTION_NAMES } from "./accordion-constant";

export type SectionNames = typeof SECTION_NAMES[keyof typeof SECTION_NAMES];

export type SectionElementRefs = {
    [key in `${SectionNames}Section`]?: ElementRef;
};

export type SectionVisibility = {
    [key in `show${Capitalize<SectionNames>}Section`]: boolean;
};

