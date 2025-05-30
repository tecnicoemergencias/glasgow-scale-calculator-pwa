
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { User, MapPin, Stethoscope, FileText } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface PatientData {
  patientName?: string;
  patientAge?: number;
  patientId?: string;
  location?: string;
  evaluator?: string;
  notes?: string;
}

interface PatientFormProps {
  patientData: PatientData;
  onPatientDataChange: (data: PatientData) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({
  patientData,
  onPatientDataChange,
  isExpanded,
  onToggleExpanded
}) => {
  const { t } = useLanguage();

  const handleInputChange = (field: keyof PatientData, value: string | number) => {
    onPatientDataChange({
      ...patientData,
      [field]: value
    });
  };

  return (
    <Card className="medical-card mb-6">
      <button
        onClick={onToggleExpanded}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
        aria-expanded={isExpanded}
        aria-controls="patient-form-content"
      >
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-slate-800">
            Información del Paciente (Opcional)
          </h3>
        </div>
        <span className="text-slate-400">
          {isExpanded ? '−' : '+'}
        </span>
      </button>

      {isExpanded && (
        <div id="patient-form-content" className="px-4 pb-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient-name" className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                Nombre del Paciente
              </Label>
              <Input
                id="patient-name"
                type="text"
                value={patientData.patientName || ''}
                onChange={(e) => handleInputChange('patientName', e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="patient-age" className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                Edad
              </Label>
              <Input
                id="patient-age"
                type="number"
                min="0"
                max="120"
                value={patientData.patientAge || ''}
                onChange={(e) => handleInputChange('patientAge', parseInt(e.target.value) || 0)}
                placeholder="Ej: 45"
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="patient-id" className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" />
                ID/Historia Clínica
              </Label>
              <Input
                id="patient-id"
                type="text"
                value={patientData.patientId || ''}
                onChange={(e) => handleInputChange('patientId', e.target.value)}
                placeholder="Ej: HC-12345"
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="location" className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4" />
                Ubicación
              </Label>
              <Input
                id="location"
                type="text"
                value={patientData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Ej: Urgencias, UCI, Sala 203"
                className="w-full"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="evaluator" className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-4 h-4" />
                Evaluador
              </Label>
              <Input
                id="evaluator"
                type="text"
                value={patientData.evaluator || ''}
                onChange={(e) => handleInputChange('evaluator', e.target.value)}
                placeholder="Ej: Dr. María García"
                className="w-full"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4" />
              Observaciones
            </Label>
            <Textarea
              id="notes"
              value={patientData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Información adicional, contexto clínico, medicamentos, etc."
              className="w-full min-h-[80px]"
              rows={3}
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default PatientForm;
