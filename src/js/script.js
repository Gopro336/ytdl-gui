const ytdl = require('ytdl-core');
const fs = require('fs');
const Store = require('electron-store');
const { ipcRenderer } = require('electron');

const store = new Store();

const urlRegex = '^(https?://)?(www.)?(youtube.com|youtu.?be)/.+$';

const switchHardware = document.querySelector('input#hardware');

switchHardware.checked = store.get('disableHardwareAcceleration');

switchHardware.addEventListener('change', () => {
  if (switchHardware.checked) {
    store.set('disableHardwareAcceleration', true);
  } else {
    store.set('disableHardwareAcceleration', false);
  }
});

function downloadVideo() {
  const videoUrl = document.querySelector('input#videoUrl').value;
  const videoQuality = document.querySelector('select#videoQuality').value;
  const downloadButton = document.querySelector('button#downloadButton');
  const progressBar = document.querySelector('div#download_progress');
  let startTime;

  if (videoUrl !== '' && videoQuality !== '') {
    const regex = new RegExp(urlRegex);

    if (videoUrl.match(regex)) {
      ipcRenderer.send('open-dialog', 'true');

      ipcRenderer.on('file-path', (event, path) => {
        downloadButton.disabled = true;

        const video = ytdl(videoUrl, {
          filter: 'audioandvideo',
          quality: videoQuality,
        });

        video.pipe(fs.createWriteStream(path));

        video.once('response', () => {
          startTime = Date.now();
        });

        video.on('progress', (chunkLength, downloaded, total) => {
          const percentage = downloaded / total;
          const formattedPercentage = Math.floor(percentage * 100);
          const downloadedMinutes = (Date.now() - startTime) / 1000 / 60;
          const eta = downloadedMinutes / percentage - downloadedMinutes;

          progressBar.style.width = 0;
          progressBar.style.width = `${formattedPercentage}%`;
          progressBar.innerText = `${formattedPercentage}% (ETA: ${eta.toFixed(
            2,
          )}m)`;
        });

        video.on('end', () => {
          progressBar.style.width = 0;
          progressBar.innerText = '';
          downloadButton.disabled = false;

          ipcRenderer.send('download-complete');
        });
      });
    } else {
      ipcRenderer.send('invalid_url');
    }
  } else {
    ipcRenderer.send('fill_inputs');
  }
}
