import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve the uploads folder statically
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // 1. Helmet: Security HTTP headers
  app.use(helmet({ crossOriginResourcePolicy: false })); // allows loading images from different origins

  // 2. Compression: GZIP compression for faster response (reduces bandwidth)
  app.use(compression());

  // 3. CORS: Restrict API access to specific domains
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 4. Global Validation Pipe: Protects from Payload Tampering
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 5. Global Exception Filter: Standardized error responses instead of crashing or sending HTML
  app.useGlobalFilters(new AllExceptionsFilter());

  // 6. Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Bachelor Solution API')
    .setDescription('The complete API documentation for Bachelor Solution Platform')
    .setVersion('1.0')
    .addBearerAuth() // Adds the Authorize button for JWT tokens
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
