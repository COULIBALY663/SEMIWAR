import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/service/auth.service';
import { Role } from './common/enums/role.enum';

async function run() {
  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    console.error('Usage: npm run seed:admin -- <email> <password>');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);
  const user = await authService.createAccount(email, password, Role.ADMIN);
  console.log(`Compte admin créé: ${user.email}`);
  await app.close();
}

run();
