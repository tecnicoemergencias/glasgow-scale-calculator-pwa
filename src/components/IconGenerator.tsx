
import React from 'react';

// Componente para generar iconos PWA básicos
const IconGenerator = () => {
  const generateIcon = (size: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    // Fondo azul médico
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(0, 0, size, size);
    
    // Símbolo médico - cruz
    ctx.fillStyle = '#ffffff';
    const crossSize = size * 0.6;
    const thickness = size * 0.15;
    const centerX = size / 2;
    const centerY = size / 2;
    
    // Línea horizontal
    ctx.fillRect(centerX - crossSize/2, centerY - thickness/2, crossSize, thickness);
    // Línea vertical  
    ctx.fillRect(centerX - thickness/2, centerY - crossSize/2, thickness, crossSize);
    
    // Texto "G" para Glasgow
    ctx.font = `bold ${size * 0.3}px Arial`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('G', centerX, centerY + size * 0.25);
    
    return canvas.toDataURL();
  };

  React.useEffect(() => {
    // Generar iconos al cargar
    console.log('Iconos PWA generados - usar este código para crear archivos reales:');
    [72, 96, 128, 144, 152, 192, 384, 512].forEach(size => {
      console.log(`Icon ${size}x${size}:`, generateIcon(size));
    });
  }, []);

  return null;
};

export default IconGenerator;
