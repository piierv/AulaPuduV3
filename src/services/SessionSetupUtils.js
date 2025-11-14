export class SessionSetupUtils {
  generateSessionCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  generateQRCode(element, text) {
    // Limpiar elemento primero
    element.innerHTML = '';
    
    try {
      if (typeof QRCode === 'undefined') {
        throw new Error('QRCode library no está cargada');
      }
      
      new QRCode(element, {
        text: text,
        width: 128,
        height: 128,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
    } catch (error) {
      console.error('Error generando QR code:', error);
      element.innerHTML = `
        <div style="width: 128px; height: 128px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; border: 1px dashed #ccc;">
          <span style="color: #666; font-size: 12px;">QR Error</span>
        </div>
      `;
    }
  }
}

export const sessionSetupUtils = new SessionSetupUtils();