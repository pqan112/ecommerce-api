import { Prisma } from '@prisma/client'
import { randomInt } from 'crypto'

export function isForeignKeyConstraintPrismaError(
  error: any,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2003'
  )
}

export function isUniqueConstraintPrismaError(
  error: any,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  )
}

export function isNotFoundPrismaError(
  error: any,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  )
}

export const generateOTP = () => {
  return randomInt(100000, 1000000).toString()
}
