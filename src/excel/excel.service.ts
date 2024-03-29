import xlsx from 'node-xlsx';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExcelService {
  parse(file) {
    const data = xlsx.parse(file);
    return data;
  }

  build(sheets: Array<{ name: string; data: any[][]; options?: {} | undefined }>) {
    sheets.forEach((sheet) => {
      sheet.data.forEach((row) => {
        if (row.length === 1) {
          row.push('');
        }
      });
    });
    return xlsx.build(sheets, { compression: true });
  }
}
