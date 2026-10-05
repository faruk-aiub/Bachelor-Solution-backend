import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('Uploads')
@Controller('api/v1/uploads')
export class UploadsController {
  
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new BadRequestException('Only image files are allowed!'), false);
      }
      cb(null, true);
    }
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${file.fieldname}-${uniqueSuffix}.webp`;
    const filepath = path.join('./uploads', filename);

    // Ensure uploads folder exists
    if (!fs.existsSync('./uploads')) {
      fs.mkdirSync('./uploads');
    }

    // Compress, resize, and convert to WebP using sharp
    await sharp(file.buffer)
      .resize({ width: 1200, withoutEnlargement: true }) // Downscale if width > 1200px
      .webp({ quality: 80 }) // 80% quality for optimal size/quality ratio
      .toFile(filepath);

    // Return the URL where the file can be accessed
    const fileUrl = `${process.env.APP_URL || 'http://localhost:3000'}/uploads/${filename}`;
    
    return {
      success: true,
      url: fileUrl,
      filename: filename
    };
  }
}
