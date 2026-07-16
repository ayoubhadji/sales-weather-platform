import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('franchises')
  findFranchises() {
    return this.usersService.findFranchises();
  }
  @Get('franchises/stats')
  getFranchiseStats() {
    return this.usersService.getFranchiseStats();
  }

  @UseGuards(AuthGuard('jwt'))
@Get('me')
getMe(@Request() req) {
  return this.usersService.findOne(req.user.id);
}

@UseGuards(AuthGuard('jwt'))
@Patch('me')
updateMe(
  @Request() req,
  @Body() updateUserDto: UpdateUserDto,
) {
  return this.usersService.update(req.user.id, updateUserDto);
}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
  

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: string) {
    return this.usersService.toggleStatus(+id);
  }
}
