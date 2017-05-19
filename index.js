const path = require('path')

// external modules
const purecloud = require('purecloud_api_sdk_javascript')

// internal modules
const api = require('./lib/recording-api')
const downloadFile = require('./lib/download-file')
const utils = require('./lib/utils')

const DEFAULT_RETRY_INTERVAL = 60 * 1000 // 60 secs
const DEFAULT_RETRYS = 3
const DEFAULT_FORMAT_ID = 'WAV'

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
     * @param {number} retrys - optional
     * @param {number} retryInterval - optional
     * 
     * @returns {Promise<[string]>} - path on disk where it was downloaded
     */
    downloadSeperateChannels(interactionId, outputPath, formatId = DEFAULT_FORMAT_ID, retrys = DEFAULT_RETRYS, retryInterval = DEFAULT_RETRY_INTERVAL) {
        return api.getCallRecordingMetadata(this.recordingApi, interactionId, formatId, retrys, retryInterval)
            .then(
                function downloadCallRecordings(metadata) {
                    if (!metadata.mediaUris) {
                        return Promise.reject(new Error('RecordingUriNotFound'))
                    }

                    const uris = [metadata.mediaUris[0].mediaUri, metadata.mediaUris[1].mediaUri]

                    const extension = utils.getFileExtension(formatId)

                    const file0Path = path.join(outputPath, `${interactionId}-0.${extension}`)
                    const file1Path = path.join(outputPath, `${interactionId}-1.${extension}`)

                    return Promise.all([
                        downloadFile(uris[0], file0Path),
                        downloadFile(uris[1], file1Path)
                    ])
                }
            )
    }

    /**
     * Gets the uris of the two audio files associated with the interactions, returns uris in an array
     * 
     * @param {string} interactionId 
     * @param {string} formatId 
     * @param {number} retrys - optional
     * @param {number} retryInterval - optional
     * 
     * @returns {Promise<[string]>} - uris of both recordings
     */
    getUrisSeperateChannels(interactionId, formatId = DEFAULT_FORMAT_ID, retrys = DEFAULT_RETRYS, retryInterval = DEFAULT_RETRY_INTERVAL) {
        return api.getCallRecordingMetadata(this.recordingApi, interactionId, formatId, retrys, retryInterval)
            .then(
                function getUris(metadata) {
                    if (!metadata.mediaUris) {
                        return Promise.reject(new Error('RecordingUriNotFound'))
                    }

                    const uris = [metadata.mediaUris[0].mediaUri, metadata.mediaUris[1].mediaUri]

                    return Promise.resolve(uris)
                }
            )
    }



}