import { InternalServerErrorException } from '@nestjs/common';
import { isArray, isNotEmptyObject, isString, } from 'class-validator';
import { environment } from 'src/app/core/environment';
import { quote } from '../services/functions.service';
import { CreateQueryDto } from '../dtos/create-query.dto';
import { DeleteQueryDto } from '../dtos/delete-query.dto';
import { QueryOrderByDto } from '../dtos/query-orderby.dto';
import { UpdateQueryDto } from '../dtos/update-query.dto';
import { SelectQueryDto } from '../dtos/select-query.dto';
import { MySqlService } from './mysql.service';


export class QueriesService {

  public static async findAll(body: SelectQueryDto) {
    try {
      const { select, table, where, limit, offset, orderby, sql } = body
      const orderbyString = isArray(orderby) ? orderby.map(v => QueryOrderByDto.asString(v)).join(", ").trim() : ""
      const selectString = select.length > 0 ? select.join(", ").trim() : "*"
      const query = ` SELECT ${selectString} ` +
        ` FROM ${table} ` +
        ` ${where && isNotEmptyObject(where) ? `WHERE ${this.objectToSetSentenceSQL(where, "AND")}` : ""} ` +
        ` ORDER BY ${orderbyString != "" ? orderbyString : "id desc"} ` +
        ` ${limit ? ` LIMIT ${limit}` : ""} ${offset ? ` OFFSET ${offset}` : ""} `;
      return sql ? query.trim() : await MySqlService.query(query.trim());
    } catch (error) {
      environment.db.logs ? console.error(error) : ""
      throw new InternalServerErrorException(error.message)
    }
  }

  public static async create(body: CreateQueryDto) {
    try {
      const { values, table, sql } = body
      const queryInsert = ` INSERT INTO ${table} SET ${this.objectToSetSentenceSQL(values, ",")} `.trim();
      const querySelect = ` SELECT * FROM ${table} WHERE ${this.objectToSetSentenceSQL(values, "AND")}`.trim();
      await MySqlService.query(queryInsert)
      const inserted = await MySqlService.query(querySelect);
      return sql ? queryInsert : (inserted && Array.isArray(inserted) && inserted.length == 1 ? inserted[0] : inserted);
    } catch (error) {
      environment.db.logs ? console.error(error) : ""
      throw new InternalServerErrorException(error.message)
    }
  }

  public static async modify(body: UpdateQueryDto) {
    try {
      const { values, table, where, limit, sql } = body
      const entries = Object.entries(values)
      const query = ` UPDATE ${table} SET ${this.objectToSetSentenceSQL(values, ",")} WHERE ${this.objectToSetSentenceSQL(where, "AND")} LIMIT ${limit} `.trim();
      const querySelect = ` SELECT * FROM ${table} WHERE ${this.objectToSetSentenceSQL(values, "AND")}`.trim();
      await MySqlService.query(query)
      const updated = await MySqlService.query(querySelect);
      return sql ? query : (updated && Array.isArray(updated) && updated.length == 1 ? updated[0] : updated);
    } catch (error) {
      environment.db.logs ? console.error(error) : ""
      throw new InternalServerErrorException(error.message)
    }
  }

  public static async remove(body: DeleteQueryDto) {
    try {
      const { table, where, limit, sql } = body
      const query = ` DELETE FROM ${table} WHERE ${this.objectToSetSentenceSQL(where, "AND")} LIMIT ${limit} `.trim();
      return sql ? query : await MySqlService.query(query);
    } catch (error) {
      environment.db.logs ? console.error(error) : ""
      throw new InternalServerErrorException(error.message)
    }
  }

  public static async query(query: string) {
    try {
      return await MySqlService.query(query);
    } catch (error) {
      environment.db.logs ? console.error(error) : ""
      throw new InternalServerErrorException(error.message)
    }
  }

  public static objectToSetSentenceSQL(values: object, separator: string): string {
    return Object.entries(values).map(v => {
      let value = v[1]
      if (isString(v[1])) {
        //its a date? (getTime returns a number->isNaN == is Not a Number-> !isNaN == number-> if getTime is not a number, v[1] itsn't a date)
        if (v[0].includes("date") && !isNaN((new Date(v[1])).getTime())) {
          //its a date
          const date = new Date(v[1])
          const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate()
          let month: any = date.getMonth() + 1
          month = month < 10 ? "0" + month : month
          const hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours()
          const min = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()
          const sec = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()
          value = `${date.getFullYear()}-${month}-${day} ${hours}:${min}:${sec}`
        }
        value = quote(value)
      }
      const result = ` ${v[0]} = ${value} `
      return result
    }).join(separator).trim()
  }
}
