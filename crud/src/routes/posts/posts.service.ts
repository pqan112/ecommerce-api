import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { CreatePostBodyDTO, UpdatePostBodyDTO } from './post.dto'
import { isNotFoundPrismaError } from 'src/shared/helpers'

@Injectable()
export class PostsService {
  constructor(private readonly prismaService: PrismaService) {}

  getPosts(userId: number) {
    return this.prismaService.post.findMany({
      where: {
        authorId: userId,
      },
      include: {
        author: {
          omit: {
            password: true,
          },
        },
      },
    })
  }

  async getPost(id: number) {
    try {
      return this.prismaService.post.findUniqueOrThrow({
        where: {
          id,
        },
        include: {
          author: {
            omit: {
              password: true,
            },
          },
        },
      })
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Post not found')
      }
      throw error
    }
  }

  createPost({ userId, body }: { userId: number; body: CreatePostBodyDTO }) {
    return this.prismaService.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: userId,
      },
      include: {
        author: {
          omit: {
            password: true,
          },
        },
      },
    })
  }

  updatePost({ postId, userId, body }: { postId: number; userId: number; body: UpdatePostBodyDTO }) {
    try {
      const post = this.prismaService.post.update({
        where: {
          id: postId,
          authorId: userId,
        },
        data: {
          title: body.title,
          content: body.content,
        },
        include: {
          author: {
            omit: {
              password: true,
            },
          },
        },
      })
      return post
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Post not found')
      }
      throw error
    }
  }

  async deletePost(id: number, userId: number) {
    try {
      await this.prismaService.post.delete({
        where: {
          id,
          authorId: userId,
        },
      })
      return null
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Post not found')
      }
      throw error
    }
  }
}
