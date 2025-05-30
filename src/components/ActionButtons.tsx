
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface ActionButtonsProps {
  totalScore: number;
  isReady: boolean;
  onValidate: () => void;
  onSave: () => void;
  onReset: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  totalScore,
  isReady,
  onValidate,
  onSave,
  onReset
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex gap-4 justify-center mb-8">
      <Button
        onClick={onValidate}
        className="px-8 py-3"
        disabled={totalScore === 0}
        aria-describedby="validate-help"
      >
        {t.buttons.validate}
      </Button>
      
      <Button
        onClick={onSave}
        variant="outline"
        className="px-8 py-3 flex items-center gap-2"
        disabled={totalScore === 0 || !isReady}
      >
        <Save className="w-4 h-4" />
        Guardar
      </Button>
      
      <Button
        onClick={onReset}
        variant="outline"
        className="px-8 py-3"
        disabled={totalScore === 0}
      >
        {t.buttons.clear}
      </Button>
    </div>
  );
};

export default ActionButtons;
