const fs = require('fs')
const download = require('download')

/**
 * Downloads file at URL to local temp folder
 * @param {string} mediaUrl - media file location
 * @param {string} localPath - local file path to save result to eg sound.wav
 */
function downloadFile(mediaUrl, localPath) {
    return download(mediaUrl)
        .then((data) => {
            fs.writeFileSync(localPath, data)
            return localPath
        })
}



module.exports = downloadFile