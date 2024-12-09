export interface IExportDataModel {
  xrmEntityId: number
  entityType: string | null;
  menuId: number | null;
  fileType: number;
  headerName?: string;
  subHeaderName?: string;
  sheetName?: string;
}
