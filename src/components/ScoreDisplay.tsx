
import React from 'react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';

interface ScoreDisplayProps {
  totalScore: number;
  scores: {
    ocular: number | null;
    verbal: number | null;
    motora: number | null;
  };
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ totalScore, scores }) => {
  const { t } = useLanguage();

  const getScoreInterpretation = (score: number) => {
    if (score === 0) return { level: 'incomplete', text: t.score.interpretation.incomplete, class: 'score-display' };
    if (score >= 13) return { level: 'normal', text: t.score.interpretation.mild, class: 'score-display score-normal' };
    if (score >= 9) return { level: 'mild', text: t.score.interpretation.moderate, class: 'score-display score-mild' };
    if (score >= 3) return { level: 'moderate', text: t.score.interpretation.severe, class: 'score-display score-moderate' };
    return { level: 'severe', text: t.score.interpretation.critical, class: 'score-display score-severe' };
  };

  const interpretation = getScoreInterpretation(totalScore);

  return (
    <Card className={interpretation.class}>
      <div className="text-center">
        <div 
          className="text-sm font-medium opacity-75 mb-2"
          aria-label={t.accessibility.totalScore}
        >
          {t.score.total}
        </div>
        <div className="text-5xl font-bold mb-2" role="status" aria-live="polite">
          {totalScore}/15
        </div>
        <div className="text-lg font-semibold">{interpretation.text}</div>
        {totalScore > 0 && (
          <div className="text-sm opacity-75 mt-2">
            {t.ocular.title.split(' ')[1]}: {scores.ocular || 0} + {t.verbal.title.split(' ')[1]}: {scores.verbal || 0} + {t.motor.title.split(' ')[1]}: {scores.motora || 0}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ScoreDisplay;
