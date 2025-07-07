import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Put } from '@nestjs/common'
import { LanguageService } from './language.service'
import {
  GetLanguageDetailResDTO,
  GetLanguageParamsDTO,
  GetLanguagesResDTO,
  UpdateLanguageBodyDTO,
} from './language.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@Controller('language')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Get()
  @ZodSerializerDto(GetLanguagesResDTO)
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.languageService.findAll()
  }

  @Get(':languageId')
  @ZodSerializerDto(GetLanguageDetailResDTO)
  findById(@Param() params: GetLanguageParamsDTO) {
    return this.languageService.findById(params.languageId)
  }

  @Put(':languageId')
  @ZodSerializerDto(GetLanguageDetailResDTO)
  update(
    @Body() body: UpdateLanguageBodyDTO,
    @Param() params: GetLanguageParamsDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.languageService.update({
      data: body,
      id: params.languageId,
      updatedById: userId,
    })
  }

  @Delete(':languageId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetLanguageParamsDTO) {
    return this.languageService.delete(params.languageId)
  }
}
