
import { useState, useEffect } from 'react';

export type Language = 'es' | 'en' | 'fr';

export interface Translations {
  title: string;
  subtitle: string;
  ocular: {
    title: string;
    options: string[];
    descriptions: string[];
  };
  verbal: {
    title: string;
    options: string[];
    descriptions: string[];
  };
  motor: {
    title: string;
    options: string[];
    descriptions: string[];
  };
  score: {
    total: string;
    interpretation: {
      incomplete: string;
      mild: string;
      moderate: string;
      severe: string;
      critical: string;
    };
  };
  alerts: {
    critical: string;
    severe: string;
    updated: string;
  };
  protocols: {
    title: string;
    mild: string;
    moderate: string;
    severe: string;
    critical: string;
  };
  buttons: {
    validate: string;
    clear: string;
    language: string;
  };
  errors: {
    selectOcular: string;
    selectVerbal: string;
    selectMotor: string;
  };
  accessibility: {
    totalScore: string;
    selectOption: string;
    currentSelection: string;
  };
}

const translations: Record<Language, Translations> = {
  es: {
    title: "Escala de Coma de Glasgow",
    subtitle: "Herramienta profesional para la evaluación del nivel de consciencia. Funciona sin conexión y se puede instalar en su dispositivo.",
    ocular: {
      title: "Respuesta Ocular (1-4)",
      options: ["No responde", "Al dolor", "Al habla", "Espontánea"],
      descriptions: [
        "No abre los ojos ante ningún estímulo",
        "Abre los ojos solo ante estímulo doloroso",
        "Abre los ojos cuando se le habla",
        "Abre los ojos espontáneamente"
      ]
    },
    verbal: {
      title: "Respuesta Verbal (1-5)",
      options: ["No responde", "Incomprensible", "Inapropiada", "Confusa", "Orientada"],
      descriptions: [
        "No emite sonidos",
        "Sonidos incomprensibles, gemidos",
        "Palabras inapropiadas, no mantiene conversación",
        "Conversa pero está desorientado",
        "Conversación normal, orientado en tiempo y espacio"
      ]
    },
    motor: {
      title: "Respuesta Motora (1-6)",
      options: ["No responde", "Extensión", "Flexión anormal", "Retirada", "Localiza dolor", "Obedece órdenes"],
      descriptions: [
        "No hay respuesta motora",
        "Extensión anormal (descerebración)",
        "Flexión anormal (decorticación)",
        "Retirada ante el dolor",
        "Localiza estímulos dolorosos",
        "Obedece órdenes simples"
      ]
    },
    score: {
      total: "PUNTAJE TOTAL",
      interpretation: {
        incomplete: "Incompleto",
        mild: "Leve",
        moderate: "Moderado",
        severe: "Severo",
        critical: "Crítico"
      }
    },
    alerts: {
      critical: "⚠️ CRÍTICO: Puntaje ≤8 indica coma. Considere intubación inmediata.",
      severe: "⚠️ SEVERO: Traumatismo craneal severo. Monitoreo intensivo requerido.",
      updated: "actualizado"
    },
    protocols: {
      title: "Protocolo de Respuesta",
      mild: "• Observación cada 2 horas\n• TC si empeora\n• Alta con precauciones",
      moderate: "• Observación cada hora\n• TC cerebral urgente\n• Hospitalización 24-48h",
      severe: "• Monitoreo continuo\n• TC inmediata\n• UCI neurológica\n• Considerar PIC",
      critical: "• Intubación inmediata\n• Ventilación mecánica\n• TC urgente\n• UCI especializada\n• Monitoreo PIC"
    },
    buttons: {
      validate: "Validar Evaluación",
      clear: "Limpiar",
      language: "Idioma"
    },
    errors: {
      selectOcular: "Seleccione una respuesta ocular",
      selectVerbal: "Seleccione una respuesta verbal",
      selectMotor: "Seleccione una respuesta motora"
    },
    accessibility: {
      totalScore: "Puntaje total de la escala de Glasgow",
      selectOption: "Seleccionar opción",
      currentSelection: "Selección actual"
    }
  },
  en: {
    title: "Glasgow Coma Scale",
    subtitle: "Professional tool for consciousness level assessment. Works offline and can be installed on your device.",
    ocular: {
      title: "Eye Opening (1-4)",
      options: ["No response", "To pain", "To speech", "Spontaneous"],
      descriptions: [
        "Does not open eyes to any stimulus",
        "Opens eyes only to painful stimulus",
        "Opens eyes when spoken to",
        "Opens eyes spontaneously"
      ]
    },
    verbal: {
      title: "Verbal Response (1-5)",
      options: ["No response", "Incomprehensible", "Inappropriate", "Confused", "Oriented"],
      descriptions: [
        "Makes no sounds",
        "Incomprehensible sounds, moaning",
        "Inappropriate words, no sustained conversation",
        "Converses but disoriented",
        "Normal conversation, oriented to time and place"
      ]
    },
    motor: {
      title: "Motor Response (1-6)",
      options: ["No response", "Extension", "Abnormal flexion", "Withdrawal", "Localizes pain", "Obeys commands"],
      descriptions: [
        "No motor response",
        "Abnormal extension (decerebrate)",
        "Abnormal flexion (decorticate)",
        "Withdrawal from pain",
        "Localizes painful stimuli",
        "Obeys simple commands"
      ]
    },
    score: {
      total: "TOTAL SCORE",
      interpretation: {
        incomplete: "Incomplete",
        mild: "Mild",
        moderate: "Moderate",
        severe: "Severe",
        critical: "Critical"
      }
    },
    alerts: {
      critical: "⚠️ CRITICAL: Score ≤8 indicates coma. Consider immediate intubation.",
      severe: "⚠️ SEVERE: Severe head trauma. Intensive monitoring required.",
      updated: "updated"
    },
    protocols: {
      title: "Response Protocol",
      mild: "• Observation every 2 hours\n• CT if worsening\n• Discharge with precautions",
      moderate: "• Observation every hour\n• Urgent brain CT\n• Hospitalization 24-48h",
      severe: "• Continuous monitoring\n• Immediate CT\n• Neurological ICU\n• Consider ICP monitoring",
      critical: "• Immediate intubation\n• Mechanical ventilation\n• Urgent CT\n• Specialized ICU\n• ICP monitoring"
    },
    buttons: {
      validate: "Validate Assessment",
      clear: "Clear",
      language: "Language"
    },
    errors: {
      selectOcular: "Select an eye response",
      selectVerbal: "Select a verbal response",
      selectMotor: "Select a motor response"
    },
    accessibility: {
      totalScore: "Glasgow Coma Scale total score",
      selectOption: "Select option",
      currentSelection: "Current selection"
    }
  },
  fr: {
    title: "Échelle de Coma de Glasgow",
    subtitle: "Outil professionnel pour l'évaluation du niveau de conscience. Fonctionne hors ligne et peut être installé sur votre appareil.",
    ocular: {
      title: "Ouverture des Yeux (1-4)",
      options: ["Aucune réponse", "À la douleur", "À la parole", "Spontanée"],
      descriptions: [
        "N'ouvre pas les yeux à aucun stimulus",
        "Ouvre les yeux seulement au stimulus douloureux",
        "Ouvre les yeux quand on lui parle",
        "Ouvre les yeux spontanément"
      ]
    },
    verbal: {
      title: "Réponse Verbale (1-5)",
      options: ["Aucune réponse", "Incompréhensible", "Inappropriée", "Confuse", "Orientée"],
      descriptions: [
        "N'émet aucun son",
        "Sons incompréhensibles, gémissements",
        "Mots inappropriés, ne maintient pas la conversation",
        "Converse mais désorienté",
        "Conversation normale, orienté dans le temps et l'espace"
      ]
    },
    motor: {
      title: "Réponse Motrice (1-6)",
      options: ["Aucune réponse", "Extension", "Flexion anormale", "Retrait", "Localise la douleur", "Obéit aux ordres"],
      descriptions: [
        "Aucune réponse motrice",
        "Extension anormale (décérébration)",
        "Flexion anormale (décortication)",
        "Retrait à la douleur",
        "Localise les stimuli douloureux",
        "Obéit aux ordres simples"
      ]
    },
    score: {
      total: "SCORE TOTAL",
      interpretation: {
        incomplete: "Incomplet",
        mild: "Léger",
        moderate: "Modéré",
        severe: "Sévère",
        critical: "Critique"
      }
    },
    alerts: {
      critical: "⚠️ CRITIQUE: Score ≤8 indique un coma. Considérer l'intubation immédiate.",
      severe: "⚠️ SÉVÈRE: Traumatisme crânien sévère. Surveillance intensive requise.",
      updated: "mis à jour"
    },
    protocols: {
      title: "Protocole de Réponse",
      mild: "• Observation toutes les 2 heures\n• Scanner si aggravation\n• Sortie avec précautions",
      moderate: "• Observation toutes les heures\n• Scanner cérébral urgent\n• Hospitalisation 24-48h",
      severe: "• Surveillance continue\n• Scanner immédiat\n• USI neurologique\n• Considérer monitoring PIC",
      critical: "• Intubation immédiate\n• Ventilation mécanique\n• Scanner urgent\n• USI spécialisée\n• Monitoring PIC"
    },
    buttons: {
      validate: "Valider l'Évaluation",
      clear: "Effacer",
      language: "Langue"
    },
    errors: {
      selectOcular: "Sélectionner une réponse oculaire",
      selectVerbal: "Sélectionner une réponse verbale",
      selectMotor: "Sélectionner une réponse motrice"
    },
    accessibility: {
      totalScore: "Score total de l'échelle de coma de Glasgow",
      selectOption: "Sélectionner une option",
      currentSelection: "Sélection actuelle"
    }
  }
};

export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('glasgow-language');
    return (saved as Language) || 'es';
  });

  const t = translations[currentLanguage];

  const changeLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    localStorage.setItem('glasgow-language', lang);
  };

  return {
    currentLanguage,
    changeLanguage,
    t
  };
};
