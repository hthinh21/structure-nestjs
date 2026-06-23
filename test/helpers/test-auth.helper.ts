import type { JwtService } from '@nestjs/jwt';

export function getTestUserToken(
  jwtService: JwtService,
  user: { id: string; email: string; role: string },
): string {
  const payload = { sub: user.id, email: user.email, role: user.role };
  return jwtService.sign(payload);
}
