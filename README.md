
# Calculadora Escala de Glasgow - PWA

Una Progressive Web App (PWA) profesional para calcular la Escala de Coma de Glasgow, diseñada específicamente para profesionales médicos. La aplicación funciona completamente sin conexión y se puede instalar en dispositivos móviles y de escritorio.

## 🏥 Características Principales

### Funcionalidad Médica
- **Evaluación completa de Glasgow**: Tres secciones (Ocular, Verbal, Motora)
- **Cálculo automático**: Suma instantánea al cambiar cualquier valor
- **Validaciones médicas**: Solo permite rangos correctos (Ocular: 1-4, Verbal: 1-5, Motora: 1-6)
- **Interpretación automática**: Clasifica resultados en Leve, Moderado, Severo o Crítico
- **Interfaz intuitiva**: Diseño optimizado para uso médico rápido

### Características PWA
- ✅ **Funciona sin conexión**: Service Worker cachea todos los recursos
- ✅ **Instalable**: Se puede instalar en móviles y escritorio
- ✅ **Responsive**: Optimizada para todos los tamaños de pantalla
- ✅ **Rápida**: Carga instantánea después de la primera visita
- ✅ **Segura**: Servida sobre HTTPS en producción

## 🚀 Instalación y Ejecución

### Opción 1: Desarrollo Local
```bash
# Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>

# Navegar al directorio
cd glasgow-scale-calculator-pwa

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:8080
```

### Opción 2: Construcción para Producción
```bash
# Construir la aplicación
npm run build

# Servir los archivos estáticos (requiere un servidor web)
npx serve -s dist -l 3000

# O usar cualquier servidor web estático
python -m http.server 3000  # Python 3
php -S localhost:3000       # PHP
```

### Opción 3: Despliegue Simple
```bash
# Solo abrir index.html en navegador (para desarrollo básico)
# Nota: Algunas características PWA requieren HTTPS en producción
```

## 📱 Instalación como PWA

### En Móviles (Android/iOS)
1. Abrir la aplicación en Chrome/Safari
2. Buscar el banner "Agregar a pantalla de inicio"
3. Tocar "Instalar" o "Agregar"
4. La app aparecerá como aplicación nativa

### En Escritorio (Chrome/Edge)
1. Abrir la aplicación en el navegador
2. Buscar el ícono de instalación en la barra de direcciones
3. Hacer clic en "Instalar"
4. La app se abrirá en ventana independiente

## 🧪 Pruebas de Funcionalidad

### Probar Modo Sin Conexión
1. Abrir la aplicación con conexión
2. Usar las herramientas de desarrollo del navegador
3. Ir a "Network" y activar "Offline"
4. Recargar la página - debe seguir funcionando
5. Probar todas las funcionalidades

### Probar Cálculos
1. **Caso Normal**: Ocular=4, Verbal=5, Motora=6 = 15 puntos (Leve)
2. **Caso Moderado**: Ocular=3, Verbal=3, Motora=4 = 10 puntos (Moderado)
3. **Caso Severo**: Ocular=2, Verbal=2, Motora=3 = 7 puntos (Severo)
4. **Caso Crítico**: Ocular=1, Verbal=1, Motora=1 = 3 puntos (Crítico)

### Probar Validaciones
1. Intentar enviar sin seleccionar todas las opciones
2. Verificar mensajes de error apropiados
3. Probar función de "Limpiar"

## 🛠️ Estructura del Proyecto

```
glasgow-scale-calculator-pwa/
├── public/
│   ├── manifest.json          # Configuración PWA
│   ├── sw.js                  # Service Worker
│   └── iconos/                # Iconos PWA (varios tamaños)
├── src/
│   ├── components/ui/         # Componentes de UI (shadcn)
│   ├── hooks/                 # Custom hooks
│   ├── pages/
│   │   └── Index.tsx          # Componente principal
│   ├── index.css              # Estilos globales y médicos
│   ├── main.tsx               # Punto de entrada
│   └── App.tsx                # Configuración de rutas
├── index.html                 # HTML principal con metadatos PWA
├── tailwind.config.ts         # Configuración de Tailwind
├── vite.config.ts             # Configuración de Vite
└── README.md                  # Esta documentación
```

## 🎨 Personalización

### Colores Médicos
Los colores están definidos en `src/index.css`:
- **Azul médico**: `--medical-blue: 37 99 235`
- **Verde médico**: `--medical-green: 16 185 129`  
- **Rojo de alerta**: `--medical-red: 239 68 68`
- **Naranja advertencia**: `--medical-orange: 245 158 11`

### Modificar Interpretaciones
En `src/pages/Index.tsx`, función `getScoreInterpretation()`:
```typescript
const getScoreInterpretation = (score: number) => {
  if (score >= 13) return { level: 'normal', text: 'Leve' };
  if (score >= 9) return { level: 'mild', text: 'Moderado' };
  // ... personalizar según necesidades
};
```

## 🔧 Configuración PWA

### Manifest.json
- **Nombre**: "Calculadora Escala de Glasgow"
- **Tema**: Azul médico (#2563eb)
- **Orientación**: Retrato preferido
- **Pantalla**: Standalone (app nativa)

### Service Worker (sw.js)
- **Estrategia**: Cache First para recursos estáticos
- **Estrategia**: Network First para contenido dinámico
- **Caché**: Versión automática v1.0.0

## 📊 Métricas de Rendimiento

### Lighthouse Scores Objetivo
- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 95+
- **SEO**: 100
- **PWA**: 100

### Optimizaciones Implementadas
- Fuentes web optimizadas (font-display: swap)
- Imágenes optimizadas y lazy loading
- Service Worker con caché inteligente
- CSS crítico inline
- Bundle splitting automático

## 🔒 Consideraciones de Seguridad

### Datos Médicos
- **No almacena datos**: Los cálculos son temporales
- **Sin transmisión**: Todo funciona localmente
- **HIPAA-friendly**: No hay riesgo de violación de privacidad

### PWA Security
- **HTTPS requerido** en producción
- **Content Security Policy** configurado
- **Service Worker** firmado y versionado

## 🤝 Contribución

### Desarrollo
1. Fork el repositorio
2. Crear rama para nueva característica
3. Implementar cambios con tests
4. Enviar Pull Request

### Reportar Bugs
1. Usar el sistema de Issues de GitHub
2. Incluir pasos para reproducir
3. Especificar navegador y dispositivo
4. Adjuntar screenshots si es relevante

## 📜 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE.md para detalles.

## 📞 Soporte

Para soporte técnico o preguntas médicas sobre la implementación:
- **Issues**: GitHub Issues
- **Documentación**: Este README
- **Actualizaciones**: Revisar releases en GitHub

## 🔄 Actualizaciones

### v1.0.0
- ✅ Implementación inicial completa
- ✅ PWA funcional con cache offline
- ✅ Interfaz médica profesional
- ✅ Validaciones completas
- ✅ Instalación en dispositivos

### Próximas versiones
- 📋 Historial de evaluaciones
- 🔔 Notificaciones push
- 📊 Estadísticas de uso
- 🌐 Multiidioma
- 📱 Integración con APIs médicas

---

**⚠️ Nota Importante**: Esta herramienta está diseñada para asistir a profesionales médicos capacitados. No reemplaza el juicio clínico profesional y debe usarse únicamente por personal autorizado.
