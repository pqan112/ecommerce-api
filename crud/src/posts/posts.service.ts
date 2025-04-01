import { Injectable } from '@nestjs/common'

@Injectable()
export class PostsService {
  getPosts() {
    return 'All posts'
  }

  getPost(id: string) {
    return `post ${id}`
  }

  createPost({ id, title, content }: { id: string; title: string; content: string }) {
    return {
      id,
      title,
      content,
    }
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
