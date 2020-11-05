const ytdl = require('ytdl-core');
const fs = require('fs');
const { ipcRenderer } = require('electron');

const urlRegex = '^(https?://)?(www.)?(youtube.com|youtu.?be)/.+$';

function downloadVideo() {
  const videoUrl = document.querySelector('input#videoUrl').value;
  const videoQuality = document.querySelector('select#videoQuality').value;
  const outputConsoleArea = document.querySelector('textarea#output');
  const downloadButton = document.querySelector('button#downloadButton');

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

        video.on('progress', (chunkLength, downloaded, total) => {
          const percentage = downloaded / total;

          outputConsoleArea.value = `${Math.floor(
            percentage * 100,
          )}% downloaded`;
        });

        video.on('end', () => {
          downloadButton.disabled = false;
          outputConsoleArea.value = '';
        });
      });
    } else {
      ipcRenderer.send('invalid_url');
    }
  } else {
    ipcRenderer.send('fill_inputs');
  }
}
