const ytdl = require('ytdl-core');
const fs = require('fs');
const Store = require('electron-store');
const { ipcRenderer } = require('electron');

const store = new Store();

const switchHardware = document.getElementById('hardware');
const downloadButton = document.getElementById('downloadButton');
const videoUrl = document.getElementById('videoUrl');

switchHardware.checked = store.get('disableHardwareAcceleration');

switchHardware.addEventListener('change', () => {
  if (switchHardware.checked) {
    store.set('disableHardwareAcceleration', true);
  } else {
    store.set('disableHardwareAcceleration', false);
  }
});

function downloadVideo() {
  const videoQuality = document.getElementById('videoQuality');
  const progressBar = document.getElementById('downloadProgress');
  let startTime;

  if (videoUrl.value !== '' && videoQuality !== '') {
    if (ytdl.validateURL(videoUrl.value)) {
      ipcRenderer.send('open-dialog');

      ipcRenderer.on('file-path', (event, path) => {
        if (path === '') {
          return;
        }
        downloadButton.disabled = true;
        videoUrl.disabled = true;
        videoQuality.disabled = true;

        const video = ytdl(videoUrl.value, {
          filter: 'audioandvideo',
          quality: videoQuality.value,
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

          progressBar.value = 0;
          progressBar.value = formattedPercentage;
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

        video.on('error', () => {
          progressBar.style.width = 0;
          progressBar.innerText = '';
          downloadButton.disabled = false;

          ipcRenderer.send('video-error');
        });
      });
    } else {
      ipcRenderer.send('invalid-url');
    }
  } else {
    ipcRenderer.send('fill-inputs');
  }
}

downloadButton.addEventListener('click', () => {
  downloadVideo();
});

videoUrl.addEventListener('change', () => {
  if (!ytdl.validateURL(videoUrl.value)) {
    videoUrl.classList.add('is-danger');
  } else {
    videoUrl.classList.remove('is-danger');
    videoUrl.classList.add('is-success');
  }
});
