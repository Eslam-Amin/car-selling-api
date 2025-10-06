import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // This is a global pipe that will validate the request body
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove properties that aren't in the DTO
      // forbidNonWhitelisted: true, // Throw an error instead of just removing them
    }),
  );

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
