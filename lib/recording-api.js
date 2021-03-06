const async = require('async')

const utils = require('./utils')

function getErrorFromPurecloudResponse(response) {
    let newErr = response

    if (response.statusCode) {
        switch (response.statusCode) {
            case 404:
                newErr = new Error('RecordingMetaDataNotFound')
                break;
            case 429:
                newErr = new Error('RecordingMetaDataRateLimitHit')
                break;

            default:
                break;
        }
    }

    return newErr
}

function getCallRecordingMetadata(recordingsApi, interactionId, formatId = 'WAV', retrys = 10, retryInterval = 1000 * 60) {
    return new Promise((resolve, reject) => {

        // retry api request upto 10 times, as recording may still be transcribing
        async.retry({
                times: retrys,
                interval: retryInterval
            },
            (cb) => {
                // retryable 
                recordingsApi.getConversationIdRecordings(interactionId, 5000, formatId)
                    .then((response) => {
                        // hack to deal with API returning empty result on new id, seems to be an API bug. 
                        // this forces a retry if an empty object is recieved
                        if (utils.isEmptyObject(response)) {
                            return cb(new Error('emptyResultError'))
                        }

                        cb(null, response)
                    })
                    .catch(cb)
            },
            // finally after success or 10 failed attempts 
            (err, response) => {
                if (err) {
                    err = getErrorFromPurecloudResponse(err)
                    reject(err)
                }

                resolve(response[0])
            })
    })
}

function getMergedCallRecordingMetadata(recordingsApi, interactionId, recordingId, formatId = 'WAV', retrys = 3, retryInterval = 1000 * 60) {
    return new Promise((resolve, reject) => {

        // retry api request upto 10 times, as recording may still be transcribing
        async.retry({
                times: retrys,
                interval: retryInterval
            },
            (cb) => {
                // retryable 
                recordingsApi.getConversationIdRecordingsRecordingId(interactionId, recordingId, formatId, true)
                    .then((response) => {
                        // hack to deal with API returning empty result on new id, seems to be an API bug. 
                        // this forces a retry if an empty object is recieved
                        if (!response) {
                            return cb(new Error('emptyResultError'))
                        }

                        cb(null, response)
                    })
                    .catch(cb)
            },
            // finally after success or 10 failed attempts 
            (err, response) => {
                if (err) {
                    err = getErrorFromPurecloudResponse(err)
                    reject(err)
                }

                resolve(response)
            })
    })
}


module.exports = {
    getCallRecordingMetadata,
    getMergedCallRecordingMetadata
}