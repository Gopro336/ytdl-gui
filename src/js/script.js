const youtubedl = require('youtube-dl');
const fs = require('fs');
const { ipcRenderer } = require('electron');

const urlRegex = '^(https?://)?(www.)?(youtube.com|youtu.?be)/.+$';

function downloadVideo() {
  const videoUrl = document.querySelector('input#videoUrl').value;
  const videoFormat = document.querySelector('select#videoFormat').value;
  const outputFile = document.querySelector('input#filename').value;
  const videoQuality = document.querySelector('select#videoQuality').value;
  const outputConsoleArea = document.querySelector('textarea#output');
  const downloadButton = document.querySelector('button#downloadButton');

  if (
    videoUrl !== '' &&
    videoFormat !== '' &&
    outputFile !== '' &&
    videoQuality !== ''
  ) {
    const regex = new RegExp(urlRegex);

    if (videoUrl.match(regex)) {
      downloadButton.disabled = true;

      const video = youtubedl(videoUrl, [`--format=${videoQuality}`], {
        cwd: __dirname,
      });

      video.on('info', (info) => {
        outputConsoleArea.readOnly = false;
        outputConsoleArea.value = '';
        outputConsoleArea.value += `download started\n`;
        outputConsoleArea.value += `file name: ${info._filename}\n`;
        outputConsoleArea.value += `file size: ${info.size} bytes\n`;
        outputConsoleArea.value += `duration: ${info.duration}\n`;
        outputConsoleArea.readOnly = true;
      });

      video.on('end', (info) => {
        outputConsoleArea.readOnly = false;
        outputConsoleArea.value = '';
        outputConsoleArea.value += 'download finished\n';
        outputConsoleArea.readOnly = true;
        downloadButton.disabled = false;
      });

      video.pipe(fs.createWriteStream(`${outputFile}.${videoFormat}`));
    } else {
      ipcRenderer.send('invalid_url');
    }
  } else {
    ipcRenderer.send('fill_inputs');
  }
}
