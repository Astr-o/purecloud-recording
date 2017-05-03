const path = require('path')


// external modules
const purecloud = require('purecloud_api_sdk_javascript')

// internal modules
const api = require('./lib/recording-api')
const downloadFile = require('./lib/download-file')
const utils = require('./lib/utils')

module.exports = class CallRecordingDownloader {
    constructor(session) {
        this.recordingApi = new purecloud.RecordingApi(session)
    }

    /**
     * Downloads the two audio files assocaited with the interaction, returns the paths to both files in an array
     * 
     * @param {string} interactionId 
     * @param {string} outputPath 
     * @param {string} formatId 
     * @param {number} retrys 
     * @param {number} retryInterval 
     */
    downloadSeperateChannels(interactionId, outputPath, formatId, retrys, retryInterval) {
        return api.getCallRecordingMetadata(this.recordingApi, interactionId, formatId, retrys, retryInterval)
            .then(
                function downloadCallRecordings(metadata) {
                    if (!metadata.mediaUris) {
                        return Promise.reject(new Error('RecordingUriNotFound'))
                    }

                    const uris = [metadata.mediaUris[0].mediaUri, metadata.mediaUris[1].mediaUri]

                    const extension = utils.getFileExtension(formatId)

                    const file0Path = path.join(outputPath, `${metadata.id}-0.${extension}`)
                    const file1Path = path.join(outputPath, `${metadata.id}-1.${extension}`)

                    return Promise.all([
                        downloadFile(uris[0], file0Path),
                        downloadFile(uris[1], file1Path)
                    ])
                }
            )
    }



}