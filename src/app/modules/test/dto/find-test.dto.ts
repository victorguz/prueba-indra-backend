import { IsInt, IsOptional } from "class-validator";

export class FindTestDto {

    @IsOptional()
    @IsInt()
    id?: number;

    @IsOptional()
    @IsInt()
    numero1?: string;

    @IsOptional()
    @IsInt()
    numero2?: string;

}
