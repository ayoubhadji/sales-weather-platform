import { Injectable } from '@nestjs/common';
import {
  BlobServiceClient,
  ContainerClient,
} from '@azure/storage-blob';

@Injectable()
export class StorageService {
  private readonly containerClient: ContainerClient;

  constructor() {
    const connectionString =
      process.env.AZURE_STORAGE_CONNECTION_STRING;

    const containerName =
      process.env.AZURE_STORAGE_CONTAINER || 'products';

    if (!connectionString) {
      throw new Error(
        'AZURE_STORAGE_CONNECTION_STRING is not configured',
      );
    }

    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);

    this.containerClient =
      blobServiceClient.getContainerClient(containerName);
  }

  async uploadProductImage(
    file: Express.Multer.File,
  ): Promise<string> {
    const extension =
      file.originalname.split('.').pop() || 'jpg';

    const filename =
      `products/${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;

    const blockBlobClient =
      this.containerClient.getBlockBlobClient(filename);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype,
      },
    });

    return blockBlobClient.url;
  }
}