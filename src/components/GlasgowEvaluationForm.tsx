
import React from 'react';
import { Eye, MessageCircle, Hand } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';

interface GlasgowScores {
  ocular: number | null;
  verbal: number | null;
  motora: number | null;
}

interface GlasgowEvaluationFormProps {
  scores: GlasgowScores;
  errors: {
    ocular: string;
    verbal: string;
    motora: string;
  };
  onScoreChange: (category: keyof GlasgowScores, value: number) => void;
}

const GlasgowEvaluationForm: React.FC<GlasgowEvaluationFormProps> = ({
  scores,
  errors,
  onScoreChange
}) => {
  const { t } = useLanguage();

  const renderSection = (
    category: keyof GlasgowScores, 
    icon: React.ReactNode, 
    title: string, 
    options: string[],
    descriptions: string[]
  ) => (
    <Card className="medical-card">
      <div className="section-header">
        {icon}
        {title}
      </div>
      
      <fieldset>
        <legend className="sr-only">{title}</legend>
        <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-labelledby={`${category}-title`}>
          {options.map((option, index) => {
            const value = index + 1;
            const isSelected = scores[category] === value;
            return (
              <button
                key={value}
                onClick={() => onScoreChange(category, value)}
                className={`glasgow-button ${isSelected ? 'selected' : ''}`}
                role="radio"
                aria-checked={isSelected}
                aria-labelledby={`${category}-${value}-label`}
                aria-describedby={`${category}-${value}-desc`}
                tabIndex={isSelected ? 0 : -1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onScoreChange(category, value);
                  }
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="text-left">
                    <div id={`${category}-${value}-label`} className="font-semibold">
                      {value}. {option}
                    </div>
                    <div id={`${category}-${value}-desc`} className="text-xs opacity-75 mt-1">
                      {descriptions[index]}
                    </div>
                  </div>
                  <div className="ml-2 font-bold text-lg" aria-hidden="true">{value}</div>
                </div>
                {isSelected && (
                  <span className="sr-only">{t.accessibility.currentSelection}</span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>
      
      {errors[category] && (
        <div className="error-message" role="alert" aria-live="polite">
          {errors[category]}
        </div>
      )}
    </Card>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {renderSection(
        'ocular',
        <Eye className="w-5 h-5 text-blue-600" />,
        t.ocular.title,
        t.ocular.options,
        t.ocular.descriptions
      )}
      
      {renderSection(
        'verbal',
        <MessageCircle className="w-5 h-5 text-green-600" />,
        t.verbal.title,
        t.verbal.options,
        t.verbal.descriptions
      )}
      
      {renderSection(
        'motora',
        <Hand className="w-5 h-5 text-orange-600" />,
        t.motor.title,
        t.motor.options,
        t.motor.descriptions
      )}
    </div>
  );
};

export default GlasgowEvaluationForm;
