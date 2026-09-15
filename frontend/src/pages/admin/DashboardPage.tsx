import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  classeApi,
  eleveApi,
  parentApi,
  signalementApi,
} from '../../api/api';

export function DashboardPage() {
  const [nbClasses, setNbClasses] = useState(0);
  const [nbEleves, setNbEleves] = useState(0);
  const [nbParents, setNbParents] = useState(0);
  const [nbSignalementsNouveaux, setNbSignalementsNouveaux] = useState(0);

  useEffect(() => {
    classeApi.findAll().then((c) => setNbClasses(c.length));
    eleveApi.findAll().then((e) => setNbEleves(e.length));
    parentApi.findAll().then((p) => setNbParents(p.length));
    signalementApi
      .findAll()
      .then((s) => setNbSignalementsNouveaux(s.filter((x) => x.statut === 'NOUVEAU').length));
  }, []);

  return (
    <div>
      <h1>Tableau de bord administration</h1>
      <div className="grid-cards">
        <Link to="/admin/classes" className="stat-tile">
          <div className="value">{nbClasses}</div>
          <div className="label">Classes</div>
        </Link>
        <Link to="/admin/eleves" className="stat-tile">
          <div className="value">{nbEleves}</div>
          <div className="label">Élèves</div>
        </Link>
        <Link to="/admin/parents" className="stat-tile">
          <div className="value">{nbParents}</div>
          <div className="label">Parents</div>
        </Link>
        <Link to="/admin/signalements" className="stat-tile">
          <div className="value">{nbSignalementsNouveaux}</div>
          <div className="label">Signalements à traiter</div>
        </Link>
      </div>
    </div>
  );
}
