'use strict'

const net = require('net');

const client = net.createConnection('/tmp/mido_psp_kurs.sock')
client.on('connect', () => {
    console.log('connected')
    client.write(`RESP ./xy.txt 7\n`)
})

client.on('data', (data) => {
    console.log(`\n\n${data}`);
})
