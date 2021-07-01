'use strict'

const net = require('net')
const SOCK_PATH = '/tmp/mido_psp_kurs.sock'
const REPLACE_ALL = -1
const formatRESP = (filePath, replacesLimit = REPLACE_ALL) => {
    return `RESP ${filePath} ${replacesLimit}\n`;
}

const client = net.createConnection(SOCK_PATH)

client.on('connect', () => {
    console.log('connected')
    client.write(formatRESP('./xy.txt'))
})

client.on('data', (data) => {
    console.log(`\n\n${data}`);
})
