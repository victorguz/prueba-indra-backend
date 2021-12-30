import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { isArray, isEmpty, isNotEmptyObject, isObject, isNotEmpty } from 'class-validator';
import { MAX_RECORDS_TO_TAKE } from 'src/app/core/constants.config';
import { QueryOrderByDto } from '../dtos/query-orderby.dto';
import { QueriesService } from './queries.service';

enum CurrentQueryAction {
    SELECT = "SELECT", INSERT = "INSERT", UPDATE = "UPDATE", DELETE = "DELETE", QUERY = "QUERY"
}

@Injectable()
export class ActiveRecordService {
    private _table: string;
    private _columns: string[];
    private _where: object;
    private _orderby: QueryOrderByDto[];
    private _values: object;
    private _limit: number;
    private _offset: number;
    private _sqlQuery: string;

    private currentAction: CurrentQueryAction = undefined;
    private getOnlySQL: boolean = false

    constructor(private readonly queryService: QueriesService) { }

    /**
     * Seleccionar nombre de la tabla
     * @param table Nombre de la tabla
     * @returns QueriesService
     */
    table(table: string): ActiveRecordService {
        this.clear()
        this._table = table.trim()?.toLowerCase()
        this.currentAction = CurrentQueryAction.SELECT
        return this
    }


    /**
     * 
     * @param values nuevos valores
     * @returns QueriesService
     */
    private setValue(values: object): ActiveRecordService {
        this._values = values
        return this
    }

    /**
     * Seleccionar columnas a buscar
     * @param columns Nombres de las columnas
     * @returns QueriesService
     */
    select(...columns: string[]): ActiveRecordService {
        if (this.currentAction != CurrentQueryAction.SELECT) {
            throw new InternalServerErrorException("No se puede ejecutar esta consulta después de haber seleccionado DELETE || INSERT || QUERY || UPDATE")
        }
        this.currentAction = CurrentQueryAction.SELECT
        this._columns = columns
        return this
    }

    /**
         * Seleccionar columnas a buscar
         * @param columns Nombres de las columnas
         * @returns QueriesService
         */
    selectWithArray(columns: string[]): ActiveRecordService {
        if (this.currentAction != CurrentQueryAction.SELECT) {
            throw new InternalServerErrorException("No se puede ejecutar esta consulta después de haber seleccionado DELETE || INSERT || QUERY || UPDATE")
        }
        this.currentAction = CurrentQueryAction.SELECT
        this._columns = columns
        return this
    }
    /**
     * Asigna los valores a actualizar
     * @param where objeto (clave:valor) o string - clausula where
     * @param limit numero maximo de registros actualizados, por defecto 1, no puede ser 0
     * @returns QueriesService
     */
    update(values: object, where: object, limit: number = 1): ActiveRecordService {
        if (this.currentAction != CurrentQueryAction.SELECT) {
            throw new InternalServerErrorException("No se puede ejecutar esta consulta después de haber seleccionado DELETE || INSERT || QUERY || UPDATE")
        }
        this.currentAction = CurrentQueryAction.UPDATE
        this.setValue(values)
        this.where(where)
        this.limit(limit)
        return this
    }

    /**
     * Asigna los valores a insertar (los que no estén en el objeto tendrán sus valores por defecto o null)
     * @param columns Nombres de las columnas
     * @returns QueriesService
     */
    insert(values: object): ActiveRecordService {
        if (this.currentAction != CurrentQueryAction.SELECT) {
            throw new InternalServerErrorException("No se puede ejecutar esta consulta después de haber seleccionado DELETE || INSERT || QUERY || UPDATE")
        }
        this.currentAction = CurrentQueryAction.INSERT
        this.setValue(values)
        return this
    }

    /**
     * Seleccionar columnas a buscar
     * @param columns Nombres de las columnas
     * @returns QueriesService
     */
    delete(where: object, limit: number): ActiveRecordService {
        if (this.currentAction != CurrentQueryAction.SELECT) {
            throw new InternalServerErrorException("No se puede ejecutar esta consulta después de haber seleccionado DELETE || INSERT || QUERY || UPDATE")
        }
        this.currentAction = CurrentQueryAction.DELETE
        this.where(where)
        this.limit(limit)
        return this
    }

    /**
     * Seleccionar el numero de registros
     * @param limit numero de registros
     * @returns QueriesService
     */
    limit(limit: number, offset: number = 0): ActiveRecordService {
        this._limit = limit
        this._offset = offset
        return this
    }

    /**
     * Selecciona una clausula where
     * @param where QueryWhere
     * @returns QueriesService
     */
    where(where: object): ActiveRecordService {
        if (isNotEmptyObject(where) && isNotEmpty(where)) {
            this._where = where
        } else {
            throw new InternalServerErrorException("La clausula where tiene un parámetro vacío o invalido");
        }
        return this
    }

    /**
       * Selecciona una clausula order by
       * @param orderby QueryOrderBy[]
       * @returns QueriesService
       */
    orderBy(orderby: QueryOrderByDto[] | QueryOrderByDto | object): ActiveRecordService {
        if (Array.isArray(orderby)) {
            this._orderby = orderby
        } else if (orderby instanceof QueryOrderByDto && !Array.isArray(orderby)) {
            this._orderby = [orderby]
        } else if (isNotEmptyObject(orderby) && isNotEmpty(orderby)) {
            let newOrderBy: QueryOrderByDto = { column: "", order: "" };
            for (const key in orderby) {
                if (Object.prototype.hasOwnProperty.call(orderby, key)) {
                    const value = orderby[key];
                    newOrderBy.column = key
                    newOrderBy.order = value
                    if (this._orderby) {
                        this._orderby.push(newOrderBy)
                    } else {
                        this._orderby = [newOrderBy]
                    }
                }
            }
        } else {
            throw new InternalServerErrorException("Esta clausula orderby tiene un parámetro vacío o invalido");
        }
        return this
    }

    /**
     * Utilice un query personalizado
     * @param query 
     * @returns QueriesService
     */
    query(query: string): ActiveRecordService {
        this.clear();
        this.currentAction = CurrentQueryAction.QUERY
        this._sqlQuery = query
        return this
    }

    /**
     * Esta opcion habilita que se retornará solo la consulta SQL formada
     * @returns QueriesService
     */
    sql(): ActiveRecordService {
        this.getOnlySQL = true
        return this
    }

    /**
     * Limpia la consulta
     */
    clear() {
        this._table = "";
        this._columns = ["*"];
        this._orderby = []
        this._where = {};
        this._values = {};
        this._limit = 0;
        this._offset = 0;
        this._sqlQuery = "";
        this.currentAction = undefined;
        this.getOnlySQL = false
        return this
    }

    private checkTable() {
        if (isEmpty(this._table)) {
            throw new InternalServerErrorException("Debe seleccionar una tabla primero");
        }
    }

    private checkWhere() {
        if (isEmpty(this._where)) {
            throw new InternalServerErrorException("Esta consulta no se ejecutará sin una clausula where");
        }
    }

    private checkQuery() {
        if (isEmpty(this._sqlQuery)) {
            throw new InternalServerErrorException("No se puede realizar un query si no nos das el query :c");
        }
    }

    private checkLimit() {
        if (this._limit <= 0) {
            this._limit = MAX_RECORDS_TO_TAKE
        }
    }

    private checkValueForUpdate() {
        if (isObject(this._values) && !isNotEmptyObject(this._values)) {
            throw new InternalServerErrorException("Esta consulta no se ejecutará con objetos undefined, null o vacíos");
        }
    }
    private checkValueForInsert() {
        if ((isObject(this._values) && !isNotEmptyObject(this._values)) || isArray(this._values)) {
            throw new InternalServerErrorException("Esta consulta no se ejecutará con si el objeto es un array, undefined, null o está vacío");
        }
    }

    /**
     * Ejecuta la consulta construida
     */
    async execute(): Promise<any> {
        let result: any
        switch (this.currentAction) {
            case CurrentQueryAction.SELECT: this.checkTable(); result = await this._select(); this.clear(); return result;
            case CurrentQueryAction.INSERT: this.checkTable(); result = await this._insert(); this.clear(); return result;
            case CurrentQueryAction.UPDATE: this.checkTable(); result = await this._update(); this.clear(); return result;
            case CurrentQueryAction.DELETE: this.checkTable(); result = await this._delete(); this.clear(); return result;
            case CurrentQueryAction.QUERY: result = await this._query(); this.clear(); return result;
            default: throw new InternalServerErrorException("Debe seleccionar primero alguna acción");
        }
    }

    private async _select() {
        const result = await QueriesService.findAll({ table: this._table, select: this._columns, where: this._where, limit: this._limit < 0 ? 0 : this._limit, offset: this._offset < 0 ? 0 : this._offset, sql: this.getOnlySQL, orderby: this._orderby })
        if (this._limit == 1 && Array.isArray(result) && result.length == 1) {
            return result[0]
        }
        return result
    }

    private async _insert() {
        this.checkValueForInsert()
        return await QueriesService.create({ table: this._table, values: this._values, sql: this.getOnlySQL })
    }

    private async _update() {
        this.checkValueForUpdate()
        this.checkWhere()
        this.checkLimit()
        return await QueriesService.modify({ table: this._table, values: this._values, where: this._where, limit: this._limit, sql: this.getOnlySQL })
    }

    private async _delete() {
        this.checkWhere()
        this.checkLimit()
        return await QueriesService.remove({ table: this._table, where: this._where, limit: this._limit, sql: this.getOnlySQL })
    }

    private async _query() {
        this.checkQuery()
        if (this.getOnlySQL) {
            return this._sqlQuery
        }
        return await QueriesService.query(this._sqlQuery)
    }
}