import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/auth.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(User)
    private readonly userReposiitory: Repository<User>,
  ) {}

  async executedSeed() {
    await this.deleteTables();
    const user: User = await this.insertUsers();
    await this.insertNewProducts(user);
    return `Seed Executed`;
  }

  private async insertUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];

    seedUsers.forEach((user) => {
      users.push(this.userReposiitory.create(user));
    });
    const dbUsers: User[] = await this.userReposiitory.save(users);
    return dbUsers[0];
  }

  private async insertNewProducts(user: User) {
    const products = initialData.products;
    const insertPromises: Promise<any>[] = [];

    products.forEach((product) => {
      insertPromises.push(this.productService.create(product, user));
    });
    await Promise.all(insertPromises);

    return true;
  }

  private async deleteTables() {
    await this.productService.deleteAllProducts();
    const queryBuilder = this.userReposiitory.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }
}
