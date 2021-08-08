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
    const { rows } = await pool.query(
      `SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'jp100'`,
    );
    return rows.map(({ tablename }) => tablename);
  }

  async queryTable(language: string, table: string) {
    await this.checkTableExist(table);

    const schemas = this.schemaMap[language] || this.schemaMap.jp;

    await pool.query(`SET search_path TO ${schemas.join(',')};`);
    return await pool.query(`select * from "${table}"`);
  }

  async upsertCnTranslate({ bdat, table, row_id, text }) {
    await this.checkTableExist(table);

    const incomingTableName = `${bdat}.${table}`;

    const updateQuery = `UPDATE cn."${incomingTableName}" SET name = $1,  WHERE row_id = $2`;
    const insertQuery = `INSERT INTO cn."${incomingTableName}" (text, ) VALUES($1, $2) RETURNING *`;

    const insertChangesQuery = `INSERT INTO "changes" (user, text) VALUES($1, $2) RETURNING *`;

    pool.query(insertChangesQuery, [1]);

    console.log({ bdat, table, row_id, text });
  }
}
