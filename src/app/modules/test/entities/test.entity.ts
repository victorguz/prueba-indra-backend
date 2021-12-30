import { MapperEntity } from "src/app/core/models/entity.mapper";

export class TestEntity extends MapperEntity {


    protected static table = "multiplicaciones"

    protected static fieldsForSelect: string[] = [
        "id", "numero1", "numero2", "resultado"
    ]

    protected static fieldsForCreate: string[] = this.fieldsForSelect.concat([])

    id?: number;
    numero1?: string;
    numero2?: string;
    resultado?: string;

    beforeInsert(): TestEntity {
        this.resultado = "" + (Number(this.numero1) * Number(this.numero2))
        return this
    }

    beforeUpdate(): TestEntity {
        return this
    }
}
