
import React from 'react';
import { Card } from '@/components/ui/card';
import { FileText, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface MedicalProtocolProps {
  score: number;
}

const MedicalProtocol: React.FC<MedicalProtocolProps> = ({ score }) => {
  const { t } = useLanguage();

  const getProtocol = () => {
    if (score === 0) return null;
    if (score >= 13) return { level: 'mild', text: t.protocols.mild, color: 'text-green-700 bg-green-50 border-green-200' };
    if (score >= 9) return { level: 'moderate', text: t.protocols.moderate, color: 'text-yellow-700 bg-yellow-50 border-yellow-200' };
    if (score >= 3) return { level: 'severe', text: t.protocols.severe, color: 'text-orange-700 bg-orange-50 border-orange-200' };
    return { level: 'critical', text: t.protocols.critical, color: 'text-red-700 bg-red-50 border-red-200' };
  };

  const protocol = getProtocol();
  if (!protocol) return null;

  return (
    <Card className={`medical-card ${protocol.color} border-2`}>
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5" />
        <h3 className="font-semibold text-lg">{t.protocols.title}</h3>
        {(protocol.level === 'critical' || protocol.level === 'severe') && (
          <AlertCircle className="w-5 h-5 text-red-600" aria-label="Protocolo de emergencia" />
        )}
      </div>
      
      <div className="text-sm whitespace-pre-line leading-relaxed">
        {protocol.text}
      </div>
      
      {protocol.level === 'critical' && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
          <div className="text-xs font-medium text-red-800">
            ⚠️ EMERGENCIA MÉDICA - Activar código de trauma
          </div>
        </div>
      )}
    </Card>
  );
};

export default MedicalProtocol;
