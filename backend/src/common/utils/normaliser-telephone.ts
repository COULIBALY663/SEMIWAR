/**
 * Convertit un numéro saisi localement (ex. "07 07 12 34 56") au format
 * international E.164 (ex. "+2250707123456") exigé par les fournisseurs SMS.
 */
export function normaliserTelephone(
  telephone: string,
  indicatifPays = '225',
): string {
  const brut = telephone.trim();
  const chiffres = brut.replace(/\D/g, '');

  if (brut.startsWith('+')) return `+${chiffres}`;
  if (chiffres.startsWith('00')) return `+${chiffres.slice(2)}`;
  if (chiffres.startsWith(indicatifPays) && chiffres.length > 10) {
    return `+${chiffres}`;
  }
  return `+${indicatifPays}${chiffres}`;
}
