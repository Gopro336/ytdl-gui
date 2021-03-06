const ytdl = require('ytdl-core');
const fs = require('fs');
const Store = require('electron-store');
const { ipcRenderer } = require('electron');

const store = new Store();

const switchHardware = document.getElementById('hardware');
const downloadButton = document.getElementById('downloadButton');
const videoUrl = document.getElementById('videoUrl');
const videoQuality = document.getElementById('videoQuality');

switchHardware.checked = store.get('disableHardwareAcceleration');

switchHardware.addEventListener('change', () => {
  if (switchHardware.checked) {
    store.set('disableHardwareAcceleration', true);
  } else {
    store.set('disableHardwareAcceleration', false);
  }
});

function downloadVideo() {
  const progressBar = document.getElementById('downloadProgress');

  if (videoUrl.value !== '' && videoQuality.value !== '') {
    if (ytdl.validateURL(videoUrl.value)) {
      ytdl.getInfo(videoUrl.value).then((info) => {
        downloadButton.disabled = true;
        downloadButton.innerText = 'Please wait...';
        videoUrl.disabled = true;
        videoQuality.disabled = true;

        ipcRenderer.send('open-dialog', info.videoDetails.title);
      });

      ipcRenderer.on('file-path', (event, path) => {
        if (path === '') {
          ipcRenderer.send('invalid-path');
          return;
        }

        const video = ytdl(videoUrl.value, {
          filter: 'audioandvideo',
          quality: videoQuality.value,
        });

        video.pipe(fs.createWriteStream(path));

        video.on('progress', (chunkLength, downloaded, total) => {
          const percentage = downloaded / total;
          const formattedPercentage = Math.floor(percentage * 100);

          progressBar.value = 0;
          progressBar.value = formattedPercentage;
        });

        video.on('end', () => {
          progressBar.value = 0;

          downloadButton.disabled = false;
          downloadButton.innerText = 'Download';
          videoUrl.disabled = false;
          videoQuality.disabled = false;

          ipcRenderer.send('download-complete');
        });

        video.on('error', () => {
          progressBar.value = 0;
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
