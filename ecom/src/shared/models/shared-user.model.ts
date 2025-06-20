import { z } from 'zod'
import { UserStatus } from '../constants/auth.constant'

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email('Error.InvalidEmail'),
  name: z.string().min(1, 'Error.InvalidName').max(100, 'Error.InvalidName'),
  phoneNumber: z.string().min(1, 'Error.InvalidPhoneNumber').max(15, 'Error.InvalidPhoneNumber'),
  password: z.string().min(6, 'Error.InvalidPassword').max(100, 'Error.InvalidPassword'),
  avatar: z.string().nullable(),
  totpSecret: z.string().nullable(),
  status: z.nativeEnum(UserStatus),
  roleId: z.number().positive('Error.InvalidRoleId'),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type UserType = z.infer<typeof UserSchema>
