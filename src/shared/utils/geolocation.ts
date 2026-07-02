export type BrowserPosition = {
  latitude: number;
  longitude: number;
};

export function getCurrentBrowserPosition(): Promise<BrowserPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocalização não disponível neste dispositivo.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      () => {
        reject(
          new Error(
            'Não foi possível obter a localização. Verifique a permissão do navegador.'
          )
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 10 * 60 * 1000
      }
    );
  });
}