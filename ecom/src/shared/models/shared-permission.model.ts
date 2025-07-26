import { z } from 'zod'
import { HTTPMethod } from '../constants/role.constant'

export const PermissionSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  description: z.string(),
  module: z.string().max(500),
  path: z.string().max(1000),
  method: z.nativeEnum(HTTPMethod),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
