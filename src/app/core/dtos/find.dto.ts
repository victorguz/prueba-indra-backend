
import { IsArray, IsIn, IsInt, IsOptional, IsPositive, } from "class-validator";
import { STATUS } from "src/app/core/constants.config";
import { QueryOrderByDto } from "./query-orderby.dto";

export class FindDto {

    @IsInt()
    @IsPositive()
    @IsOptional()

    readonly limit?: number

    @IsInt()
    @IsOptional()

    readonly offset?: number = 0

    @IsIn([STATUS.ENABLED, STATUS.DISABLED,])
    @IsOptional()

    readonly status?: number = STATUS.ENABLED;


    @IsArray()
    @IsOptional()

    readonly orderby?: QueryOrderByDto[];
}
