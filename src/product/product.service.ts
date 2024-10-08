import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    try {
      return this.prisma.product.create({
        data: createProductDto,
      });
    } catch (error) {
      throw new BadRequestException('Failed to create product');
    }
  }

  async findAll(page: number=1, limit: number=3, baseUrl?: string) {
    try {
      if (!page || !limit) {
        const data = await this.prisma.product.findMany();
        return { data };
      }
      limit = Number(limit);
      page = Number(page);
      const skip = (page - 1) * limit;
      const data = await this.prisma.product.findMany({ skip, take: limit });
      const total = await this.prisma.product.count();

      const nextPage = page * limit < total ? page + 1 : null;

      let nextLink = null;
      if (nextPage && baseUrl) {
        nextLink = `${baseUrl}?page=${nextPage}&limit=${limit}`;
      }

      return { data, total, nextLink };
    } catch (error) {
      throw new BadRequestException('Failed to fetch products');
    }
  }

  async findOne(id: string) {
    try {
      const product = await this.prisma.product.findUnique({ where: { id } });
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      return product;
    } catch (error) {
      throw new BadRequestException('Failed to fetch product');
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.prisma.product.findUnique({ where: { id } });
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      return this.prisma.product.update({
        where: { id },
        data: updateProductDto,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw new BadRequestException('Failed to update product');
    }
  }

  async remove(id: string) {
    try {
      const product = await this.prisma.product.findUnique({ where: { id } });
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      return await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw new BadRequestException('Failed to delete product');
    }
  }

  async searchProduct(keyword: string) {
    try {
      return this.prisma.product.findMany({
        where: {
          name: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to search products');
    }
  }
}