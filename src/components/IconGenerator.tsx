
import React from 'react';

// Componente mejorado para generar todos los iconos PWA necesarios
const IconGenerator = () => {
  const generateIcon = (size: number, isApple = false) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    // Fondo con gradiente médico
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#2563eb');
    gradient.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Para iconos de Apple, agregar esquinas redondeadas
    if (isApple && size >= 144) {
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      const radius = size * 0.18;
      ctx.roundRect(0, 0, size, size, radius);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
    
    // Símbolo médico - cruz
    ctx.fillStyle = '#ffffff';
    const crossSize = size * 0.5;
    const thickness = size * 0.12;
    const centerX = size / 2;
    const centerY = size / 2;
    
    // Sombra para la cruz
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = size * 0.02;
    ctx.shadowOffsetX = size * 0.01;
    ctx.shadowOffsetY = size * 0.01;
    
    // Línea horizontal de la cruz
    ctx.fillRect(centerX - crossSize/2, centerY - thickness/2, crossSize, thickness);
    // Línea vertical de la cruz
    ctx.fillRect(centerX - thickness/2, centerY - crossSize/2, thickness, crossSize);
    
    // Resetear sombra
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Texto "G" para Glasgow
    if (size >= 72) {
      ctx.font = `bold ${size * 0.25}px Arial, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = size * 0.008;
      ctx.strokeText('G', centerX, centerY + size * 0.22);
      ctx.fillText('G', centerX, centerY + size * 0.22);
    }
    
    return canvas.toDataURL();
  };

  const generateFavicon = (size: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    // Fondo azul
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(0, 0, size, size);
    
    // Cruz médica simple
    ctx.fillStyle = '#ffffff';
    const crossSize = size * 0.6;
    const thickness = size * 0.2;
    const centerX = size / 2;
    const centerY = size / 2;
    
    ctx.fillRect(centerX - crossSize/2, centerY - thickness/2, crossSize, thickness);
    ctx.fillRect(centerX - thickness/2, centerY - crossSize/2, thickness, crossSize);
    
    return canvas.toDataURL();
  };

  const generateScreenshot = (width: number, height: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    // Fondo
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);
    
    // Simular interfaz de la app
    const isWide = width > height;
    
    if (isWide) {
      // Vista wide - escritorio
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(width * 0.1, height * 0.1, width * 0.8, height * 0.8);
      
      // Header simulado
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(width * 0.1, height * 0.1, width * 0.8, height * 0.15);
      
      // Título
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${height * 0.04}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('Calculadora Escala de Glasgow', width * 0.5, height * 0.19);
      
    } else {
      // Vista narrow - móvil
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(width * 0.05, height * 0.05, width * 0.9, height * 0.9);
      
      // Header móvil
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(width * 0.05, height * 0.05, width * 0.9, height * 0.12);
      
      // Título móvil
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${width * 0.06}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('Glasgow Scale', width * 0.5, height * 0.115);
    }
    
    return canvas.toDataURL();
  };

  React.useEffect(() => {
    console.log('=== ICONOS PWA GENERADOS ===');
    console.log('Copia estos data URLs y guárdalos como archivos PNG:');
    console.log('');
    
    // Iconos principales
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
    sizes.forEach(size => {
      console.log(`📱 icon-${size}x${size}.png:`);
      console.log(generateIcon(size));
      console.log('');
    });
    
    // Favicons
    console.log('🌐 favicon-16x16.png:');
    console.log(generateFavicon(16));
    console.log('');
    
    console.log('🌐 favicon-32x32.png:');
    console.log(generateFavicon(32));
    console.log('');
    
    // Apple touch icon
    console.log('🍎 apple-touch-icon.png (180x180):');
    console.log(generateIcon(180, true));
    console.log('');
    
    // Screenshots
    console.log('📸 screenshot-wide.png (1280x720):');
    console.log(generateScreenshot(1280, 720));
    console.log('');
    
    console.log('📱 screenshot-narrow.png (720x1280):');
    console.log(generateScreenshot(720, 1280));
    console.log('');
    
    console.log('=== INSTRUCCIONES ===');
    console.log('1. Abre las herramientas de desarrollador (F12)');
    console.log('2. Ve a la pestaña Console');
    console.log('3. Copia cada data URL');
    console.log('4. Pégalo en el navegador para ver la imagen');
    console.log('5. Guarda cada imagen con el nombre indicado en /public/');
    console.log('');
    console.log('💡 Alternativamente, usa este código para descargar automáticamente:');
    console.log(`
// Ejecuta este código en la consola para descargar todos los iconos:
const downloadIcon = (dataUrl, filename) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
};

// Descargar todos los iconos
${sizes.map(size => `downloadIcon('${generateIcon(size)}', 'icon-${size}x${size}.png');`).join('\n')}
downloadIcon('${generateFavicon(16)}', 'favicon-16x16.png');
downloadIcon('${generateFavicon(32)}', 'favicon-32x32.png');
downloadIcon('${generateIcon(180, true)}', 'apple-touch-icon.png');
downloadIcon('${generateScreenshot(1280, 720)}', 'screenshot-wide.png');
downloadIcon('${generateScreenshot(720, 1280)}', 'screenshot-narrow.png');
    `);
    
  }, []);

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="font-semibold text-blue-900 mb-2">🎨 Generador de Iconos PWA</h3>
      <p className="text-blue-700 text-sm mb-3">
        Los iconos se han generado automáticamente. Abre la consola del navegador (F12) para ver los enlaces de descarga.
      </p>
      <div className="flex flex-wrap gap-2">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
          G
        </div>
        <div className="text-xs text-blue-600 flex items-center">
          ← Así se verán tus iconos
        </div>
      </div>
      <p className="text-xs text-blue-600 mt-2">
        Revisa la consola para obtener todos los archivos de iconos necesarios para tu PWA.
      </p>
    </div>
  );
};

export default IconGenerator;
