import { randomInt } from 'node:crypto';

// Alphabet sans caractères ambigus (pas de 0/O, 1/I/l) pour rester lisible
// quand l'administrateur doit le recopier ou le dicter au chef de classe.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function genererMotDePasseLisible(longueur = 10): string {
  let motDePasse = '';
  for (let i = 0; i < longueur; i++) {
    motDePasse += ALPHABET[randomInt(ALPHABET.length)];
  }
  return motDePasse;
}
