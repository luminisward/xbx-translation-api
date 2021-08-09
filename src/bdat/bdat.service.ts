import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

const pool = new Pool();

@Injectable()
export class BdatService {
  schemaMap = {
    jp: ['jp102', 'jp101', 'jp100'],
    yx: ['youxia'],
    cn: ['cn', 'jp102', 'jp101', 'jp100'],
  };

  private allTable = [];

  async checkTableExist(table: string) {
    if (!this.allTable || this.allTable.length === 0) {
      this.allTable = await this.getTables();
    }

    if (!this.allTable.includes(table)) {
      throw new Error(table + ' not exist');
    }
  }

  async getTables(): Promise<string[]> {
    const { rows } = await pool.query(`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'jp100'`);
    return rows.map(({ tablename }) => tablename);
  }

  async queryTable(language: string, table: string) {
    await this.checkTableExist(table);

    const schemas = this.schemaMap[language] || this.schemaMap.jp;

    await pool.query(`SET search_path TO ${schemas.join(',')};`);
    return await pool.query(`select * from "${table}"`);
  }

  async queryTableRow(language: string, table: string, row_id: number) {
    await this.checkTableExist(table);
    const schemas = this.schemaMap[language] || this.schemaMap.jp;
    await pool.query(`SET search_path TO ${schemas.join(',')};`);
    const { rows } = await pool.query(`select * from "${table}" where row_id = ${row_id}`);
    if (rows.length === 1) {
      return rows[0];
    }
    if (rows.length === 0) {
      return;
    }
    throw new Error(`table: ${table} row_id: ${row_id} result rows length > 1`);
  }
}
