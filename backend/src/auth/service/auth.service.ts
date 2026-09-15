import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repository/user.repository';
import { Role } from '../../common/enums/role.enum';
import { User } from '../entity/user.entity';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  }

  async createAccount(
    email: string,
    plainPassword: string,
    role: Role,
  ): Promise<User> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new UnauthorizedException('Un compte existe déjà avec cet email');
    }
    const passwordHash = await this.hashPassword(plainPassword);
    return this.userRepository.createUser(email, passwordHash, role);
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    return this.authentifierParMotDePasse(user, password);
  }

  /**
   * Connexion par mot de passe pour un compte déjà résolu autrement qu'un
   * email (ex: chef/sous-chef de classe via leur matricule).
   */
  async loginAvecMotDePasse(userId: string, password: string) {
    const user = await this.userRepository.findById(userId);
    return this.authentifierParMotDePasse(user, password);
  }

  private async authentifierParMotDePasse(
    user: User | null,
    password: string,
  ) {
    if (!user || !user.actif) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    return this.buildAuthResponse(user);
  }

  /**
   * Réinitialise le mot de passe d'un compte existant (ex: admin qui
   * redonne l'accès à un chef/sous-chef de classe ayant oublié le sien).
   * Le mot de passe en clair n'est jamais stocké ni consultable ensuite :
   * seule cette réinitialisation permet de "récupérer" l'accès.
   */
  async redefinirMotDePasse(userId: string, plainPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Compte introuvable');
    }
    user.passwordHash = await this.hashPassword(plainPassword);
    await this.userRepository.save(user);
  }

  /**
   * Émet un token pour un compte identifié autrement que par mot de passe
   * (ex: élève via matricule+date de naissance, parent via téléphone+nom).
   */
  async issueTokenForUserId(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.actif) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
}
