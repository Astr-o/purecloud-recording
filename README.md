# Purecloud Recording Downloader

[![npm version](https://badge.fury.io/js/purecloud-recording.svg)](https://badge.fury.io/js/purecloud-recording)

This module is a wrapper for the purecloud javascript sdk that allows you to quickly download voice recordings for backup.

## Installation

**note: this library has only been tested with v1 of the purecloud API and is required to use it**

```bash
npm install purecloud_api_sdk_javascript purecloud-recording
```

## Usage

Download Split channel recordings, this will create one file for the agent channel and seprate file for the customer channel, best for transcription.

```javascript
const path = require('path')

const purecloud = require('purecloud_api_sdk_javascript')
const RecordingDownloader = require('purecloud-recording')

// login session first
session.login()
    .then(() => {

        // pass authenticated session to RecordingDownloader 
        const downloader = new RecordingDownloader(session)
        const downloadFolder = path.join(__dirname, 'recordings')
        // * is optional arguments
        // downloader.downloadSeperateChannels(conversationId, folderPath, fileFormat, retries*, waitBetweenRetrys*, createFolder*, fileName*)
        downloader.downloadSeperateChannels('930bcb90-f62e-4f41-8e09-b35b9b9ff1a8', downloadFolder, 'WAV', 3, 15 * 1000, true)
            .then(([path0, path1]) => {
                console.log(`downloaded files ${path0} - ${path1}`)
                console.log('split files downloaded successfully')
            })
            .catch(err => {
                console.error(`recording download failed ${err.message}`)
            })
    })

```

Download merged channel recordings, this will create one file for both the agent channel and customer channel, best for backups

```javascript
const path = require('path')

const purecloud = require('purecloud_api_sdk_javascript')
const RecordingDownloader = require('purecloud-recording')

// login session first
session.login()
    .then(() => {

        // pass authenticated session to RecordingDownloader 
        const downloader = new RecordingDownloader(session)
        const downloadFolder = path.join(__dirname, 'recordings')

        // * is optional arguments
        // downloader.downloadSeperateChannels(conversationId, folderPath, fileFormat, retries*, waitBetweenRetrys*, createFolder*, fileName*)
        downloader.downloadMergedChannels('930bcb90-f62e-4f41-8e09-b35b9b9ff1a8', downloadFolder, 'MP3', 3, 15 * 1000)
            .then(([path0, path1]) => {
                console.log(`downloaded files ${path}`)
                console.log('merged file downloaded successfully')
            })
            .catch(err => {
                console.error(`recording download failed ${err.message}`)
            })
    })

```

This library also provides too additional methods, which will just fetch the uri for the file location from purecloud without downloading the actual file.

```javascript
getUrisSeperateChannels(interactionId, formatId, retrys, retryInterval)
getUrisMergedChannels(interactionId, formatId, retrys, retryInterval)
```

## Change log

* **v0.3.2 - 24/01/2018**
  * adds support of creating nested directories with mkdirp
  * cleans up docs

* **v0.3.1 - 23/01/2018**
  * add optional file name variable to *downlaod methods allowing you to specify a custom file name for the output files. 

* **v0.3.0 - 19/01/2018**
  * Adds downloadMergedRecording method this will download a single file containing both the agent and the client recording channels
  * Adds outputPath creation, if the specificed output path does not exist and createDir is true a file path will automatically be created

## Tests

```bash
npm test
```