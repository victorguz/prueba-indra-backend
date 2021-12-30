import { IsInt, IsNumberString, IsOptional } from "class-validator";

export class CreateTestDto {

    @IsNumberString()
    numero1?: string;

    @IsNumberString()
    numero2?: string;

}
