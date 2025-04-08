import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { PostsService } from './posts.service'
import { APIKeyGuard } from 'src/shared/guards/api-key.guard'

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(APIKeyGuard)
  @Get()
  getPosts() {
    return this.postsService.getPosts()
  }

  @Post()
  createPost(@Body() { author_id, title, content }: { author_id: string; title: string; content: string }) {
    return this.postsService.createPost({ author_id: Number(author_id), title, content })
  }

  @Get(':id')
  getPost(@Param('id') id: string) {
    return this.postsService.getPost(id)
  }

  @Put(':id')
  updatePost(@Body() body: { id: string; title: string; content: string }, @Param('id') id: string) {
    return this.postsService.updatePost(id, body)
  }

  @Delete(':id')
  deletePost(@Param('id') id: string) {
    return this.postsService.deletePost(id)
  }
}
