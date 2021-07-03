'use strict'

const net = require('net')

// Console interface
if (process.argv.length < 4) {
    help()
    process.exit(0)
}

callDaemon(process.argv[2], process.argv[3])

// The client
function callDaemon(sourceKey, replaceLimit) {
    const SOCK_PATH = '/tmp/mido_psp_kurs.sock'
    const REPLACE_ALL = -1
    const formatRESP = (filePath, replacesLimit = REPLACE_ALL) => {
        return `RESP ${filePath} ${replacesLimit}\n`;
    }

    const client = net.createConnection(SOCK_PATH)

    client.on('connect', () => {
        console.log('Connected to the daemon')
        client.write(formatRESP(sourceKey, replaceLimit))
    })

    client.on('data', (data) => {
        const body = data.toString().trim()
        if (String(parseInt(body)) !== String(body)) {
            console.error(`Something goes unexpected. Response: ${body}`)
            process.exit(1)
        }

        console.log(`OK Result: ${body} replaces made. Check the output in ${sourceKey + '.out'}`);
    })

    client.on('close', () => {
        console.log('Connection closed.')
    })

    client.on('error', () => {
        console.error(`Connection error!`)
        process.exit(1)
    })
}

// Usage
function help() {
    console.log(`Space replacer. Usage:\n\t$ node light_server.js full_src_file_path <number_of_replaces>\n\r`
        + `\twhere <number_of_replaces> is an integer value, if less than 0\n`
        + `\tmeans replace as many as possible\n`)
}