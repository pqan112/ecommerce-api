import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { PostsService } from './posts.service'
import { Auth } from 'src/shared/decorators/auth.decorator'
import { AuthType, ConditionGuard } from 'src/shared/constants/auth.constant'
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { CreatePostBodyDTO, GetPostItemDTO, UpdatePostBodyDTO } from './post.dto'

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // @UseGuards(APIKeyGuard)
  @Auth([AuthType.Bearer, AuthType.ApiKey], { condition: ConditionGuard.Or })
  @UseGuards(AuthenticationGuard)
  @Get()
  getPosts(@ActiveUser('userId') userId: number) {
    return this.postsService.getPosts(userId).then((posts) => posts.map((post) => new GetPostItemDTO(post)))
  }

  @Post()
  @Auth([AuthType.Bearer])
  async createPost(@Body() body: CreatePostBodyDTO, @ActiveUser('userId') userId: number) {
    return new GetPostItemDTO(await this.postsService.createPost({ userId, body }))
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    return new GetPostItemDTO(await this.postsService.getPost(Number(id)))
  }

  @Put(':id')
  @Auth([AuthType.Bearer])
  async updatePost(@Body() body: UpdatePostBodyDTO, @Param('id') id: string, @ActiveUser('userId') userId: number) {
    return new GetPostItemDTO(await this.postsService.updatePost({ postId: Number(id), userId, body }))
  }

  @Delete(':id')
  @Auth([AuthType.Bearer])
  async deletePost(@Param('id') id: string, @ActiveUser('userId') userId: number): Promise<null> {
    return this.postsService.deletePost(Number(id), userId)
  }
}
