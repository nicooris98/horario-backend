import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DatabaseExceptionFilter } from './common/filters/database-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:4200',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.useGlobalFilters(new DatabaseExceptionFilter());

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Horarios API')
    .setDescription('Documentación de la API de gestión de horarios')
    .setVersion('1.0')
    .addCookieAuth('access_token', {
      type: 'apiKey',
      in: 'cookie',
      description:
        'Token JWT enviado automáticamente por el backend en la cookie httpOnly `access_token` tras el login.',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
