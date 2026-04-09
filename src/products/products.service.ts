import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ILike, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { validate as isValidUUID } from 'uuid';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  findAll(pagination: PaginationDto) {
    const { limit = 10, offset = 0 } = pagination;
    return this.productRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(term: string) {
    let product: Product | null;

    if (isValidUUID(term)) {
      product = await this.productRepository.findOneBy({
        id: term,
      });
    } else {
      // Opción 1
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where('title ILIKE :title OR slug ILIKE :slug', {
          title: term,
          slug: term,
        })
        .getOne();

      // Opción 2
      /*
      product = await this.productRepository.findOneBy([
        {
          slug: ILike(term),
        },
        {
          title: ILike(term),
        },
      ]);
      */
    }

    if (!product) {
      throw new NotFoundException(`Product with term ${term} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
    });
    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);

    try {
      await this.productRepository.save(product);
    } catch (error) {
      this.handleDBExceptions(error);
    }
    return product;
  }

  async remove(id: string) {
    const product: Product = await this.findOne(id);
    await this.productRepository.remove(product);
    return {
      deleted: true,
      id,
    };
  }

  private handleDBExceptions(error) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
