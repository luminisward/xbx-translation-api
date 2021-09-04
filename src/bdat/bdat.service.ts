import { Injectable } from '@nestjs/common';
import { Client, Pool } from 'pg';

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

  private async setSearchPath(language = 'jp', client?: Client | Pool) {
    const schemas = this.schemaMap[language];
    if (!client) {
      client = pool;
    }
    await client.query(`SET search_path TO ${schemas.join(',')};`);
  }

  async getTables(): Promise<string[]> {
    const { rows } = await pool.query(`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'jp100'`);
    return rows.map(({ tablename }) => tablename);
  }

  async getMsTables() {
    const rows = await this.getTables();
    return rows.filter((rowName) => rowName.includes('_ms')).sort();
  }

  async getTablesMap() {
    const tables = await this.getTables();
    const ret = {} as Record<string, string[]>;
    for (const table of tables) {
      const [prefix, suffix] = table.split('.');
      if (!ret[prefix]) {
        ret[prefix] = [];
      }
      ret[prefix].push(suffix);
    }
    return ret;
  }

  async queryTable(language: string, table: string) {
    await this.checkTableExist(table);
    await this.setSearchPath(language);
    const { rows } = await pool.query(`select * from "${table}"`);
    return rows;
  }

  async queryTableRow(language: string, table: string, row_id: number) {
    await this.checkTableExist(table);
    await this.setSearchPath(language);
    const { rows } = await pool.query(`select * from "${table}" where row_id = ${row_id}`);
    if (rows.length === 1) {
      return rows[0];
    }
    if (rows.length === 0) {
      return;
    }
    throw new Error(`table: ${table} row_id: ${row_id} result rows length > 1`);
  }

  async fullTextSearch(language: string, tables: string[], text: string) {
    for (const table of tables) {
      await this.checkTableExist(table);
    }

    const client = new Client();
    await client.connect();

    await this.setSearchPath(language, client);

    const result = [];
    for (const table of tables) {
      try {
        const { rows } = await client.query(`SELECT * FROM "${table}" WHERE name like $1`, [`%${text}%`]);
        result.push(...rows.map((row) => ({ ...row, table })));
      } catch (e) {
        if (e.message !== 'column "name" does not exist') {
          console.log('bdat full text search error:', language, table, text, e.message);
          throw e;
        }
      }
    }
    await client.end();
    return result;
  }
}
