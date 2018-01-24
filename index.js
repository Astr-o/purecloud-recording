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
const DEFAULT_CREATE_DIR = true

module.exports = class CallRecordingDownloader {
    constructor(session) {
        this.recordingApi = new purecloud.RecordingApi(session)
    }

    /** 
     * Downloads the two audio files assocaited with the interaction one for the agent channel and one for the customer channel, returns the paths to both files in an array
     * @param {string} interactionId 
     * @param {string} outputPath 
     * @param {string} formatId 
     * @param {number} retrys - optional
     * @param {number} retryInterval - optional
     * @param {boolean} createDir - optional - default true, if true output path will created automatically if it does not exist, if false an error will be thrown 
     * 
     * @returns {Promise<[string]>} - path on disk where it was downloaded
     */
    downloadSeperateChannels(interactionId, outputPath, formatId = DEFAULT_FORMAT_ID, retrys = DEFAULT_RETRYS, retryInterval = DEFAULT_RETRY_INTERVAL, createDir = DEFAULT_CREATE_DIR, fileName = null) {
        return utils.checkDirExistsAndCreate(outputPath, createDir)
            .then(() => this.getUrisSeperateChannels(interactionId, formatId, retrys, retryInterval))
            .then(function downloadCallRecordings([id, uris]) {
                const extension = utils.getFileExtension(formatId)


                const file0Path = path.join(outputPath, `${fileName ? fileName : id}-0.${extension}`)
                const file1Path = path.join(outputPath, `${fileName ? fileName : id}-1.${extension}`)

                return Promise.all([
                    downloadFile(uris[0], file0Path),
                    downloadFile(uris[1], file1Path)
                ])
            })
    }


    /**
     * Downloads the two audio files assocaited with the interaction one for the agent channel and one for the customer channel, returns the paths to both files in an array
     * 
     * @param {string} interactionId 
     * @param {string} outputPath 
     * @param {string} formatId 
     * @param {number} retrys - optional
     * @param {number} retryInterval - optional
     * @param {boolean} createDir - optional - default true, if true output path will created automatically if it does not exist, if false an error will be thrown 
     * 
     * @returns {Promise<[string]>} - path on disk where it was downloaded
     */
    downloadMergedChannels(interactionId, outputPath, formatId = DEFAULT_FORMAT_ID, retrys = DEFAULT_RETRYS, retryInterval = DEFAULT_RETRY_INTERVAL, createDir = DEFAULT_CREATE_DIR, fileName = null) {
        return utils.checkDirExistsAndCreate(outputPath, createDir)
            .then(() => this.getUriMergedChannels(interactionId, formatId, retrys, retryInterval))
            .then(([id, uri]) => {
                const extension = utils.getFileExtension(formatId)

                const filePath = path.join(outputPath, `${fileName ? fileName : id}-dual-channel.${extension}`)

                return downloadFile(uri, filePath)
            })
    }

    /**
     * Gets the uris of the two audio files associated with the interactions, returns uris in an array
     * 
     * @param {string} interactionId 
     * @param {string} formatId 
     * @param {number} retrys - optional
     * @param {number} retryInterval - optional
     * 
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

                    const recordingId = metadata.id
                    const uris = [metadata.mediaUris[0].mediaUri, metadata.mediaUris[1].mediaUri]

                    return [recordingId, uris]
                }
            )
    }

    /**
     * Gets the uri of the a single audio file with merged agent and customer channels
     * 
     * @param {string} interactionId 
     * @param {string} formatId 
     * @param {number} retrys - optional
     * @param {number} retryInterval - optional
     * 
     * @returns {Promise<string>} - uri of the merged recording
     */
    getUriMergedChannels(interactionId, formatId = DEFAULT_FORMAT_ID, retrys = DEFAULT_RETRYS, retryInterval = DEFAULT_RETRY_INTERVAL) {
        return api.getCallRecordingMetadata(this.recordingApi, interactionId, formatId, retrys, retryInterval)
            .then(metadata => {
                const recordingId = metadata.id

                if (!recordingId) {
                    return Promise.reject(new Error('RecordingIdNotFound'))
                }

                return api.getMergedCallRecordingMetadata(this.recordingApi, interactionId, recordingId, formatId, retrys, retryInterval)
            })
            .then(metadata => {
                if (!metadata.mediaUris || !metadata.mediaUris.S || !metadata.mediaUris.S.mediaUri) {
                    return Promise.reject(new Error('RecordingUriNotFound'))
                }

                const recordingId = metadata.id
                const uri = metadata.mediaUris.S.mediaUri

                return [recordingId, uri]
            })
    }



}