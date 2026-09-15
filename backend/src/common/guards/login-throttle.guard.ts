import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

interface Tentatives {
  count: number;
  resetAt: number;
}

const FENETRE_MS = 60_000;
const MAX_TENTATIVES = 5;

/**
 * Anti-bruteforce minimal pour les routes de connexion : au-delà de
 * MAX_TENTATIVES sur une fenêtre glissante de FENETRE_MS pour un même
 * couple (IP, identifiant présenté), renvoie 429. Utile ici car la
 * connexion élève/parent repose sur des identifiants à faible entropie
 * (date de naissance, nom de famille) plutôt que sur un mot de passe.
 *
 * Stockage en mémoire du process : suffisant en mono-instance ; prévoir un
 * store partagé (Redis) avant tout scale-out horizontal.
 */
@Injectable()
export class LoginThrottleGuard implements CanActivate {
  private readonly tentatives = new Map<string, Tentatives>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const body = (request.body ?? {}) as Record<string, unknown>;
    const identifiant = String(
      body.email ?? body.matricule ?? body.telephone ?? '',
    ).toLowerCase();
    const cle = `${request.ip}:${identifiant}`;

    this.purgerEntreesExpirees();

    const maintenant = Date.now();
    const entree = this.tentatives.get(cle);

    if (!entree || entree.resetAt <= maintenant) {
      this.tentatives.set(cle, { count: 1, resetAt: maintenant + FENETRE_MS });
      return true;
    }

    if (entree.count >= MAX_TENTATIVES) {
      throw new HttpException(
        'Trop de tentatives de connexion, réessayez dans une minute.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    entree.count += 1;
    return true;
  }

  private purgerEntreesExpirees(): void {
    if (this.tentatives.size < 10_000) {
      return;
    }
    const maintenant = Date.now();
    for (const [cle, entree] of this.tentatives) {
      if (entree.resetAt <= maintenant) {
        this.tentatives.delete(cle);
      }
    }
  }
}
