const path = require('path')
const fs = require('fs')

const purecloud = require('purecloud_api_sdk_javascript')

const testConfig = require('./test-config')
const RecordingDownloader = require('../index')

const session = purecloud.PureCloudSession({
    strategy: testConfig.strategy,
    clientId: testConfig.clientId,
    clientSecret: testConfig.clientSecret,
    environment: testConfig.environment,
})

function testSeprateChannels() {
    try {

        const outputDir = path.join(__dirname, 'output-split', 'subfolder')

        if (fs.existsSync(outputDir)) {
            // if old test data exists delete
            const files = fs.readdirSync(outputDir)

            files.forEach(f => {
                fs.unlinkSync(path.join(outputDir, f))
            })
        }


        session.login()
            .then(() => {

                const downloader = new RecordingDownloader(session)
                const downloadFolder = outputDir

                return downloader.downloadSeperateChannels('930bcb90-f62e-4f41-8e09-b35b9b9ff1a8', downloadFolder, 'WAV', 3, 15 * 1000)
                    .then(([path0, path1]) => {
                        console.log(`downloaded files ${path0} - ${path1}`)

                        if (!fs.existsSync(path0)) {
                            console.log(`failed - download seprate file0 ${path0} is not found`)
                            return
                        }

                        if (!fs.existsSync(path1)) {
                            console.log(`failed - download seprate file1 ${path1} is not found`)
                            return
                        }

                        console.log('files downloaded successfully')
                    })

            })
            .catch(err => {
                console.log('Test download seperate failed!!!')
                console.error(err)
                console.error(err.stack)
            })

    } catch (err) {
        console.log('Test download seperate failed!!!')
        console.error(err)
        console.error(err.stack)
    }
}

function testMergedChannels() {
    try {

        const outputDir = path.join(__dirname, 'output-merged')

        if (fs.existsSync(outputDir)) {
            // if old test data exists delete
            const files = fs.readdirSync(outputDir)

            files.forEach(f => {
                fs.unlinkSync(path.join(outputDir, f))
            })
        }


        session.login()
            .then(() => {

                const downloader = new RecordingDownloader(session)
                const downloadFolder = path.join(__dirname, 'output-merged')

                return downloader.downloadMergedChannels('930bcb90-f62e-4f41-8e09-b35b9b9ff1a8', downloadFolder, 'WAV', 3, 15 * 1000, true, 'test-file')
                    .then(path => {
                        console.log(`downloaded files ${path}`)

                        if (!fs.existsSync(path)) {
                            console.log(`failed download merged - file ${path} is not found`)
                            return
                        }


                        console.log('files downloaded successfully')
                    })

            })
            .catch(err => {
                console.log('Test merged failed!!!')
                console.error(err)
                console.error(err.stack)
            })

    } catch (err) {
        console.log('Test merged failed!!!')
        console.error(err)
        console.error(err.stack)
    }
}

testSeprateChannels()
testMergedChannels()