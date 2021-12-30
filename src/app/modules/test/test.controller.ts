import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CreateTestDto } from './dto/create-test.dto';
import { FindTestDto } from './dto/find-test.dto';
import { TestEntity } from './entities/test.entity';

@Controller('test')
export class TestController {
  constructor() { }

  @Post()
  async create(@Body() body: CreateTestDto) {
    const result = await TestEntity.save(body);

    return {
      id: result.id,
      numero1: BigInt(result.numero1),
      numero2: BigInt(result.numero2),
      resultado: BigInt(result.resultado),
    }
  }

  @Get()
  async findAll(@Query() query: FindTestDto) {
    const result = await TestEntity.find(query)

    return result.map(val => {
      val.numero1 = BigInt(val.numero1)
      val.numero2 = BigInt(val.numero2)
      val.resultado = BigInt(val.resultado)
      return val
    });
  }
}
