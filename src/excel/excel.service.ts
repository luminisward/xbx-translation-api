import xlsx from 'node-xlsx';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExcelService {
  parseFile() {
    return xlsx.parse(`/Users/pneuma/Downloads/test.xlsx`);
  }

  parse(data) {
    return xlsx.parse(data);
  }

  build(data: Array<{ name: string; data: any[][]; options?: {} | undefined }>) {
    return xlsx.build(data, { compression: true });
  }
}
