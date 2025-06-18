import { createZodDto } from 'nestjs-zod'
import { MessageResSchema } from '../models/response.model'

export class MessageResDTO extends createZodDto(MessageResSchema) {}
