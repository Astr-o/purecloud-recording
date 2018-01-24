const fs = require('fs')
const mkdirp = require('mkdirp-promise')

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

function checkDirExistsAndHasPermissions(path) {
    return new Promise((resolve, reject) => {
        fs.access(path, fs.constants.W_OK, (err) => {
            // exists
            if (!err) {
                return resolve(true)
            }

            // other error or dir does not exist and create is false
            if (err.code === 'ENOENT') {
                return resolve(false)
            }

            return reject(err)
        })
    })
}

/**
 * 
 * first checks if a path exists and if not it creates it
 * 
 * @param {*} path 
 * @param {*} create 
 */
function checkDirExistsAndCreate(path) {
    return checkDirExistsAndHasPermissions(path)
        .then(res => {
            if (!res) {
                return mkdirp(path)
            } else {
                return path
            }
        })
        .catch(err => {
            return Promise.reject(err)
        })
}

module.exports = {
    getFileExtension,
    isEmptyObject,
    checkDirExistsAndCreate
}