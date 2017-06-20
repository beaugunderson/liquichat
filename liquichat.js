'use strict';

const ColorHash = require('color-hash');
const fg = require('term-true-color').fg;
const fs = require('fs');
const moment = require('moment');
const signalR = require('signalr-client');

const client = new signalR.client('wss://chat.liqui.io/api', ['ChatHub']);
const hasher = new ColorHash({lightness: 0.75});

const hashes = {};

function logNow() {
  return moment().format('YYMMDD HH:mm');
}

function displayNow() {
  return moment().format('HH:mm');
}

function log(message) {
  fs.appendFileSync('liqui.log', `${logNow()} ${message.Name}: ${message.Msg}\n`);
}

function colorCurrencies(message) {
  return message
    .replace('USD', fg('USD', 'green'))
    .replace('PTOY', fg('PTOY', 'red'))
    .replace('CFI', fg('CFI', 'blue'))
    .replace('ETH', fg('ETH', 'yellow'))
    .replace('ANS', fg('ANS', 'gold'))
    .replace('BAT', fg('BAT', 'orange'));
}

function colorName(name) {
  const lowerName = name.toLowerCase();

  if (!hashes[lowerName]) {
    hashes[lowerName] = hasher.hex(lowerName);
  }

  return fg(name, hashes[lowerName]);
}

function colorResponseName(message) {
  const responseName = message.match(/@? ?([a-z0-9_-]+)/i);

  if (responseName &&
      responseName.length > 0 &&
      hashes[responseName[1].toLowerCase()]) {
    return message.replace(
      new RegExp(`@? ?${responseName[1]}`, 'gi'),
      fg(responseName[1].toLowerCase(), hashes[responseName[1].toLowerCase()]));
  }

  return message;
}

client.on('ChatHub', 'Message', (message) => {
  log(message);

  console.log(`${fg(displayNow(), 'gray')} ${colorName(message.Name)}: ${colorCurrencies(colorResponseName(message.Msg))}`);
});
