import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({origin:"*"});
  app.useGlobalPipes(
  new ValidationPipe({
    transform: true, // this is mandatory
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Master Application API')
    .setDescription('The Master Application API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 6000, ()=>{
    console.log(`client service running on port ${process.env.PORT}`)
  });
}
bootstrap();
