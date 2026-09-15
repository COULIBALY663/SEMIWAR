const LABELS: Record<string, string> = {
  PRESENT: 'Présent',
  ABSENT: 'Absent',
  ABSENT_JUSTIFIE: 'Absent justifié',
  EN_COURS: 'En cours',
  VALIDE: 'Validé',
  NOUVEAU: 'Nouveau',
  TRAITE: 'Traité',
  ENVOYE: 'Envoyé',
  ECHEC: 'Échec',
};

const CLASSES: Record<string, string> = {
  PRESENT: 'present',
  ABSENT: 'absent',
  ABSENT_JUSTIFIE: 'absent-justifie',
  NOUVEAU: 'nouveau',
  TRAITE: 'traite',
  EN_COURS: 'en-cours',
  VALIDE: 'valide',
  ENVOYE: 'traite',
  ECHEC: 'absent',
};

export function StatutBadge({ statut }: { statut: string }) {
  const classe = CLASSES[statut] ?? '';
  return (
    <span className={`badge ${classe}`}>{LABELS[statut] ?? statut}</span>
  );
}
