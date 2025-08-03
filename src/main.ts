import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { ClearSkyTokenService } from './clearsky/clearsky-token.service';
import { ConfigService } from '@nestjs/config';
import refresh from './utility/update-clearsky-token';
dotenv.config(); 


async function bootstrap() {
  //console.log('Starting Master Application Backend...');
  const app = await NestFactory.create(AppModule);
  app.enableCors({origin:"*"});
  app.useGlobalPipes(
  new ValidationPipe({
    transform: true, // this is mandatory
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
);


  // const configService = app.get(ConfigService);
  // const tokenService = app.get(ClearSkyTokenService);

  // const email = configService.get<string>('CLEARSKY_USER');
  // const password = configService.get<string>('CLEARSKY_PASS');

  // try {
  //   const token = await refresh({ useremail: email, password });
  //   await tokenService.setToken(token);
  //   console.log('Token initialized before app start');
  // } catch (err) {
  //   console.error('Failed to fetch token at startup:', err.message);
  // }

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
