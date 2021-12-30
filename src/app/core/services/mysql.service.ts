import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { isNotEmpty } from 'class-validator';
import * as mysql from 'mysql2';
import { environment, getEnvironmentParam, NODE_ENV } from 'src/app/core/environment';

@Injectable()
export class MySqlService {

  private static async getConnectionConfig(): Promise<mysql.PoolOptions> {
    return {
      database: await getEnvironmentParam("DB_NAME", `DB_NAME_${NODE_ENV}`),
      port: 3306,
      host: await getEnvironmentParam("DB_HOST", `DB_HOST`),
      user: await getEnvironmentParam("DB_USER", `DB_USER`),
      password: await getEnvironmentParam("DB_PASSWORD", `DB_PASSWORD`),
      connectTimeout: 60000, //Tiempo maximo de sesión (60 segundos)
    }
  }

  public static async query(query: string) {
    query = query.trim()
    if (!isNotEmpty(query)) {
      throw new InternalServerErrorException("No se puede ejecutar una consulta vacía.");
    }
    const conn = mysql.createPool(await this.getConnectionConfig()).promise();
    const [rows, fields] = await conn.query(query);
    await conn.end()
    environment.db.logs ? console.debug(query) : ""
    return rows;
  }

  async query(query: string) {
    return MySqlService.query(query)
  }
}
