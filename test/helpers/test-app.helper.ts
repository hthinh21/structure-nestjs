import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { AppModule } from '../../src/app.module';
import { AllExceptionsFilter } from '../../src/common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
  await app.init();
  return app;
}
