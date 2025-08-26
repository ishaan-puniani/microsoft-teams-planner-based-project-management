import mapKeys from 'lodash/mapKeys';
import { Excel } from 'src/modules/shared/excel/excel';
import ExporterSchema from 'src/modules/shared/exporter/exporterSchema';

export default class Exporter {
  schema: ExporterSchema;
  excelFileName: string;

  constructor(fields, excelFileName) {
    this.schema = new ExporterSchema(fields);
    this.excelFileName = excelFileName;
  }

  transformAndExportAsExcelFile(rows) {
    const exportableData = rows.map((row) => {
      const rowCasted = this.schema.cast(row);
      return this._makeNameHeadersIntoLabels(rowCasted);
    });

    return Excel.exportAsExcelFile(
      exportableData,
      this.schema.labels,
      this.excelFileName + '_' + new Date().getTime(),
    );
  }

  _makeNameHeadersIntoLabels(row) {
    return mapKeys(row, (value, key) => {
      return this.schema.labelOf(key);
    });
  }
}
