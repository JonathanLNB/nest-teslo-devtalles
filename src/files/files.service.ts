import { BadRequestException, Injectable } from '@nestjs/common';
import { join } from 'path';
import { existsSync } from 'node:fs';

@Injectable()
export class FilesService {
  getStaticProductImage(imageName: string) {
    const path = join(__dirname, '../../static/products', imageName);
    if (!existsSync(path))
      throw new BadRequestException(`File ${imageName} does not exist`);

    return path;
  }
}
