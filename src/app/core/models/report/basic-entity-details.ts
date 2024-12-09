import { FieldAttributes } from "./report-payload";

export interface PopularEntitiesDetails{
        Id: number;
        UKey: string | null;
        Name: string;
        NameLocalizedKey: string;
        Description: string | null;
        DescLocalizedKey: string;
        IsPopular: boolean;
}

export interface BasicEntitiesDetails {
        Description?: string | null;
        Id: number;
        Name: string;
        NameLocalizedKey: string;
        DataEntities: PopularEntitiesDetails[];
}

export interface DataEntityTables {
        LinkedDataAvailable: boolean;
        entity: DataEntity;
        tables: EntityTables[];
}

export interface EntityTables {
        accountIdField: string | null;
        customTable: boolean;
        customTableSql: string;
        doNotDisplay: boolean;
        fields: FieldAttributes[];
        schemaName: string;
        tableDbName: string;
        tableId: number | null;
        tableName: string;
        tableRoles: []
}

export interface DataEntity {
        DescLocalizedKey: string | null;  // Assuming DescLocalizedKey can be a string or null
        Description: string;
        Id: number;
        IsPopular: boolean;
        Name: string;
        NameLocalizedKey: string;
        UKey: string;
        UserNo: number;
       }
