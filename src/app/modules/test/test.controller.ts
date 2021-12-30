import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { isArray } from 'class-validator';
import { CreateTestDto } from './dto/create-test.dto';
import { FindTestDto } from './dto/find-test.dto';
import { TestEntity } from './entities/test.entity';

@Controller('test')
export class TestController {
  constructor() { }

  @Post()
  async create(@Body() body: CreateTestDto) {
    const result = await TestEntity.save(body);
    if (isArray(result)) {

      return {
        id: result[0].id,
        numero1: BigInt(result[0].numero1).toString(),
        numero2: BigInt(result[0].numero2).toString(),
        resultado: BigInt(result[0].resultado).toString(),
      }
    } else {
      return {
        id: result.id,
        numero1: BigInt(result.numero1).toString(),
        numero2: BigInt(result.numero2).toString(),
        resultado: BigInt(result.resultado).toString(),
      }
    }
  }

  @Get()
  async findAll(@Query() query: FindTestDto) {
    const result = await TestEntity.find(query)

    return result.map(val => {
      val.numero1 = BigInt(val.numero1).toString()
      val.numero2 = BigInt(val.numero2).toString()
      val.resultado = BigInt(val.resultado).toString()
      return val
    });
  }
}
