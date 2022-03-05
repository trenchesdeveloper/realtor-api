import { IUser } from './../user/decorators/user.decorator';
import { PropertyType } from '@prisma/client';
import { CreateHomeDto, HomeResponseDto } from './dto/home.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { HomeService } from './home.service';
import { User } from 'src/user/decorators/user.decorator';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}
  @Get()
  getHomes(
    @Query('city') city?: string,
    @Query('propertyType') propertyType?: PropertyType,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ): Promise<HomeResponseDto[]> {
    const price =
      minPrice || maxPrice
        ? {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          }
        : undefined;

    const filter = {
      ...(city && { city }),
      ...(propertyType && { propertyType }),
      ...(price && price),
    };

    return this.homeService.getHomes(filter);
  }

  @Get(':id')
  getHomeById(@Param('id', ParseIntPipe) id: number) {
    return this.homeService.getHomeById(id);
  }

  @Post()
  createHome(@Body() createHomeDto: CreateHomeDto, @User() user: IUser) {
    return this.homeService.createHome(createHomeDto, user.id);
  }

  @Put(':id')
  async updateHome(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<CreateHomeDto>,
    @User() user: IUser,
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(id);

    if (realtor.id !== user.id) {
      throw new UnauthorizedException();
    }

    return this.homeService.updateHome(id, body);
  }

  @Delete(':id')
  deleteHome(@Param('id', ParseIntPipe) id: number, @User() user: IUser) {
    return this.homeService.deleteHome(id);
  }
}
