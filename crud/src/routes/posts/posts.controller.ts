import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { PostsService } from './posts.service'
import { Auth } from 'src/shared/decorators/auth.decorator'
import { AuthType, ConditionGuard } from 'src/shared/constants/auth.constant'
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // @UseGuards(APIKeyGuard)
  @Auth([AuthType.Bearer, AuthType.ApiKey], { condition: ConditionGuard.Or })
  @UseGuards(AuthenticationGuard)
  @Get()
  getPosts() {
    return this.postsService.getPosts()
  }

  @Post()
  @Auth([AuthType.Bearer])
  createPost(@Body() { title, content }: { title: string; content: string }, @ActiveUser('userId') userId: number) {
    return this.postsService.createPost({ userId, title, content })
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
