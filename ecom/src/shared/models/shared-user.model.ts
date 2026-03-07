import { z } from 'zod'
import { UserStatus } from '../constants/auth.constant'
import { RoleSchema } from './shared-role.model'
import { PermissionSchema } from './shared-permission.model'

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email('Error.InvalidEmail'),
  name: z.string().min(1, 'Error.InvalidName').max(100, 'Error.InvalidName'),
  phoneNumber: z
    .string()
    .min(1, 'Error.InvalidPhoneNumber')
    .max(15, 'Error.InvalidPhoneNumber'),
  password: z
    .string()
    .min(6, 'Error.InvalidPassword')
    .max(100, 'Error.InvalidPassword'),
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

export const GetUserProfileResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
}).extend({
  role: RoleSchema.pick({
    id: true,
    name: true,
  }).extend({
    permissions: z.array(
      PermissionSchema.pick({
        id: true,
        name: true,
        module: true,
        path: true,
        method: true,
      }),
    ),
  }),
})

export const UpdateProfileResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
})

export type UserType = z.infer<typeof UserSchema>
export type GetUserProfileResType = z.infer<typeof GetUserProfileResSchema>
export type UpdateProfileResType = z.infer<typeof UpdateProfileResSchema>
