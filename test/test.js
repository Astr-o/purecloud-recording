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


try {

    const outputDir = path.join(__dirname, 'output')

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir)
    } else {
        // if old test data exists delete
        const files = fs.readdirSync(outputDir)

        files.forEach(f => {
            fs.unlinkSync(path.join(outputDir, f))
        })
    }


    session.login()
        .then(() => {

            const downloader = new RecordingDownloader(session)
            const downloadFolder = path.join(__dirname, 'output')

            downloader.downloadSeperateChannels('930bcb90-f62e-4f41-8e09-b35b9b9ff1a8', downloadFolder, 'WAV', 3, 15 * 1000)
                .then(([path0, path1]) => {
                    console.log(`downloaded files ${path0} - ${path1}`)

                    if (!fs.existsSync(path0)) {
                        console.log('failed - file0 is not found')
                        return
                    }

                    if (!fs.existsSync(path1)) {
                        console.log('failed - file1 is not found')
                        return
                    }

                    console.log('files downloaded successfully')
                })

        })
        .catch(err => {
            console.error(err)
        })

} catch (err) {
    console.error(err)
}