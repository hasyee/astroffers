export const fetchLocation = (): Promise<{ latitude; longitude }> =>
  fetch('http://freegeoip.net/json')
    .then(response => response.json())
    .then(({ latitude, longitude }) => ({ latitude, longitude }));
