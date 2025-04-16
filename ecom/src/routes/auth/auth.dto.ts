import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const RegisterBodySchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
    name: z.string().min(1).max(100),
    confirmPassword: z.string().min(6).max(100),
    phoneNumber: z.string().min(1).max(20),
  })
  .strict() // .strict() ensures that no other fields are present in the object
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password and confirm password must be same',
        path: ['confirmPassword'],
      })
    }
  })

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}
