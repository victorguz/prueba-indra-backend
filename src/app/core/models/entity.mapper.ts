import { BadRequestException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { arrayNotEmpty, isEmpty, isNotEmpty, isNotEmptyObject } from "class-validator";
import { ActiveRecordService } from "src/app/core/services/active-record.service";
import { QueriesService } from "../services/queries.service";

export abstract class MapperEntity {

    protected static table: string
    protected static fieldsForSelect: string[] = ["*"]
    protected static fieldsForCreate: string[] = []
    private static activeRecord: ActiveRecordService = new ActiveRecordService(new QueriesService)

    static create(value: any) {
        if (!arrayNotEmpty(this.fieldsForCreate)) { throw new InternalServerErrorException("El campo fieldsForCreate de la entidad es necesario"); }
        if (!isNotEmpty(value) && !isNotEmptyObject(value)) { throw new BadRequestException("Esta función no se puede usar con valores que están vacíos"); }
        const object = this.prototype
        this.fieldsForCreate.forEach(key => {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                if (typeof value[key] == 'undefined') {
                    value[key] = null
                    // throw new BadRequestException(`Los valores del campo '${key}' no pueden ser undefined, asigne null en su lugar`)
                }
                object[key] = value[key]
            }
        });
        for (const key in object) {
            if (Object.prototype.hasOwnProperty.call(object, key)) {
                const element = object[key];
                if (typeof element == 'undefined') {
                    throw new Error("Este objeto no tiene los valores requeridos")
                }
            }
        }
        return object
    }

    public static async find(body?: any, fullField: boolean = false) {
        if (isNotEmpty(body) && isNotEmptyObject(body)) {
            const { limit, offset, orderby, ...where } = body
            return await this.activeRecord.table(this.table)
                .selectWithArray(fullField ? ["*"] : this.fieldsForSelect)
                .where(where).limit(limit ? limit : 0, offset ? offset : 0)
                .orderBy(orderby ? orderby : [{ column: "id", order: "desc" }])
                .execute()
        } else {
            return await this.activeRecord.table(this.table)
                .selectWithArray(fullField ? ["*"] : this.fieldsForSelect)
                .orderBy([{ column: "id", order: "desc" }])
                .execute()
        }
    }
    public static async count(body?: any) {
        if (isNotEmpty(body) && isNotEmptyObject(body)) {
            const { limit, offset, orderby, ...where } = body
            const result = await this.activeRecord.table(this.table)
                .select("count(*) as count")
                .where(where)
                .execute()
            return result[0]
        } else {
            const result = await this.activeRecord.table(this.table)
                .select("count(*) as count")
                .execute()
            return result[0]
        }
    }
    public static async save(body: any) {
        const prototype = this.create(body).beforeInsert()
        return await this.activeRecord.table(this.table).insert(prototype).execute();
    }

    public static async modify(id: number, body: any) {
        const find = await this.activeRecord.table(this.table).where({ id }).execute()
        if (find && find.length > 0) {
            const prototype = this.create(body).beforeInsert()
            if (isEmpty(prototype) || !isNotEmptyObject(prototype)) {
                return find[0]
            }
            return await this.activeRecord.table(this.table).update(prototype, { id }, 1).execute()
        } else {
            throw new NotFoundException("Entity not found")
        }
    }

    public static async remove(id: number) {
        return await this.activeRecord.table(this.table).delete({ id }, 1).execute()
    }

    public static async query(query: string) {
        return await this.activeRecord.query(query).execute();
    }

    public static mapper() {
        return this.activeRecord;
    }
    abstract beforeInsert(): MapperEntity;
    abstract beforeUpdate(): MapperEntity;
}