export interface EventData {
	AuditLogs?: any,
    Data: [
        User: string | undefined | null,
        UserGroup: string | undefined | null,
        Action: string | undefined | null,
        ActionDate: Date | undefined | null,
        Device: string | undefined | null,
        ReasonForChange: string | undefined | null,
        AuditLogs?: AuditLogs[]
    ]
}

export interface AuditLogs {
    Field: string | undefined | null,
    OldValue: string | undefined | null,
    NewValue: string | undefined | null,
    Section: string | undefined | null,
    SubSection: string | undefined | null,
    Action: string | undefined | null,
    ValueType: any,
    DecimalPlaces: any,
    CountryId: any
}
