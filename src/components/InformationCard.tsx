
import React from 'react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';

const InformationCard: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Card className="medical-card mt-8">
      <h3 className="font-semibold text-slate-800 mb-4">Interpretación de Resultados</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <div className="font-medium text-green-700">13-15 puntos: {t.score.interpretation.mild}</div>
          <div className="text-slate-600">Traumatismo craneal leve</div>
        </div>
        <div>
          <div className="font-medium text-yellow-700">9-12 puntos: {t.score.interpretation.moderate}</div>
          <div className="text-slate-600">Traumatismo craneal moderado</div>
        </div>
        <div>
          <div className="font-medium text-orange-700">3-8 puntos: {t.score.interpretation.severe}</div>
          <div className="text-slate-600">Traumatismo craneal severo</div>
        </div>
        <div>
          <div className="font-medium text-red-700">≤ 8 puntos: {t.score.interpretation.critical}</div>
          <div className="text-slate-600">Indica coma, requiere intubación</div>
        </div>
      </div>
    </Card>
  );
};

export default InformationCard;
