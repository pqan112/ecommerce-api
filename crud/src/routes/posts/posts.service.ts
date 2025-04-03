import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class PostsService {
  constructor(private readonly prismaService: PrismaService) {}

  getPosts() {
    return this.prismaService.post.findMany()
  }

  getPost(id: string) {
    return `post ${id}`
  }

  createPost({ author_id, title, content }: { author_id: number; title: string; content: string }) {
    return this.prismaService.post.create({
      data: {
        title,
        content,
        author_id,
      },
    })
    // return {
    //   id,
    //   title,
    //   content,
    // }
  }

  updatePost(id: string, body: { id: string; title: string; content: string }) {
    return {
      id,
      title: body.title,
      content: body.content,
    }
  }

  deletePost(id: string) {
    return `Delete post ${id} succeessfully`
  }
}
