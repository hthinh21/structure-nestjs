import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from '../../app.module';
import { ROLES } from '../../common/constants/role.constants';
import { UserService } from '../../user/services/user.service';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Seeder');
  logger.log('Starting database seeding...');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const userService = app.get(UserService);

    const adminEmail = 'admin@example.com';
    const exists = await userService.existsByEmail(adminEmail);
    if (!exists) {
      await userService.create({
        email: adminEmail,
        password: 'AdminPassword123!',
        role: ROLES.ADMIN,
      });
      logger.log('Admin user seeded successfully.');
    } else {
      logger.log('Admin user already exists.');
    }

    await app.close();
    logger.log('Database seeding completed successfully.');
  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  }
}

void bootstrap();
