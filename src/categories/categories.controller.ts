import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { GetCategoriesDto } from './dto/get-categories.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll(@Query() query: GetCategoriesDto) {
    return this.categoriesService.getCategories(query);
  }

  @Get('liquor')
  getLiquorCategories(@Query() options: any) {
    return this.categoriesService.getLiquorCategories(options);
  }

  @Get('hierarchy')
  getCategoryHierarchy() {
    return this.categoriesService.getCategoryHierarchy();
  }

  @Get('type/:liquorType')
  getCategoriesByType(@Param('liquorType') liquorType: string) {
    return this.categoriesService.getCategoriesByType(liquorType);
  }

  @Get('search/:query')
  searchCategories(@Param('query') query: string, @Query() filters: any) {
    return this.categoriesService.searchCategories(query, filters);
  }

  @Get(':id/stats')
  getCategoryStats(@Param('id') id: string) {
    return this.categoriesService.getCategoryStats(+id);
  }

  @Get(':param')
  findOne(@Param('param') param: string, @Query('language') language: string) {
    return this.categoriesService.getCategory(param, language);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
