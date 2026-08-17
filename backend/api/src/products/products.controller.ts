import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  InternalServerErrorException,
} from '@nestjs/common';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  BlobServiceClient,
  BlockBlobClient,
} from '@azure/storage-blob';

import { extname } from 'path';

@Controller('products')
export class ProductsController {
  private readonly containerName = 'products';

  constructor(private readonly productsService: ProductsService) {}

  // Azure Blob Storage client
  private getContainerClient() {
    const connectionString =
      process.env.AZURE_STORAGE_CONNECTION_STRING;

    if (!connectionString) {
      throw new Error(
        'AZURE_STORAGE_CONNECTION_STRING is not configured',
      );
    }

    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);

    return blobServiceClient.getContainerClient(
      this.containerName,
    );
  }

  // POST /products
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // POST /products/upload
  @Post('upload')
@UseInterceptors(FileInterceptor('file'))
async uploadProductImage(
  @UploadedFile() file: Express.Multer.File,
) {
  console.log("🔥 AZURE BLOB UPLOAD VERSION ACTIVE");
  console.log("File:", file?.originalname);

  if (!file) {
    throw new InternalServerErrorException(
      'No image file received',
    );
  }

  try {
    const containerClient = this.getContainerClient();

    const uniqueName =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      extname(file.originalname);

    const blockBlobClient: BlockBlobClient =
      containerClient.getBlockBlobClient(uniqueName);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype,
      },
    });

    console.log("🔥 Uploaded to:", blockBlobClient.url);

    return {
      imageUrl: blockBlobClient.url,
    };
  } catch (error) {
    console.error('Azure Blob upload error:', error);

    throw new InternalServerErrorException(
      'Failed to upload image to Azure Blob Storage',
    );
  }
}

  // GET /products
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  // GET /products/1
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  // PATCH /products/1
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(
      id,
      updateProductDto,
    );
  }

  // DELETE /products/1
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}