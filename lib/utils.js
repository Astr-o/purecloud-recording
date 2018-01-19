const fs = require('fs')

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

function checkDirExists(path, create = true) {
    return new Promise((resolve, reject) => {

        fs.access(path, fs.constants.W_OK, (err) => {
            // exists
            if (!err) {
                return resolve()
            }

            // other error or dir does not exist and create is false
            if (err.code !== 'ENOENT' || (err.code === 'ENOENT' && !create)) {
                return reject(err)
            }

            //create
            fs.mkdir(path, (err) => {
                if (err) {
                    return reject(err)
                }

                resolve()
            })
        })
    })
}

module.exports = {
    getFileExtension,
    isEmptyObject,
    checkDirExists
}