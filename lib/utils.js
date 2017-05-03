function getFileExtension(formatId) {
    switch (formatId) {
        case 'WAV':
            return 'wav'
        case 'WEBM':
            return 'webm'
        default:
            return 'wav'
    }
}

function isEmptyObject(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object
}

module.exports = {
    getFileExtension,
    isEmptyObject
}