import { IsInt, IsOptional } from "class-validator";

export class CreateTestDto {

    @IsInt()
    numero1?: number;

    @IsInt()
    numero2?: number;

}
