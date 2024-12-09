export const SECTION_NAMES = {
	jobDetails: 'jobDetails',
	approverDetails: 'approverDetails',
	otherDetails: 'otherDetails',
	commentDetails: 'commentDetails',
	documentUploads: 'documentUploads'
} as const;

export type SectionName = keyof typeof SECTION_NAMES;
