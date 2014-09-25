var express = require('express'),
    app = module.exports = express(),
    io = require('../../server.js'),
    fs = require('fs'),
    squirrel = require('squirrel'),
    EventEmitter = require('events').EventEmitter,
    emitter = new EventEmitter();

// To let another bundle's index.js take advantage of sublistener, we must export an event listener.
// Socket.io dosn't work for inter-index.js communciation, because broadcasts don't loopback.
// AND, since we're already exporting an express app, we have to export this emitter as a property so as not to interfere
module.exports.emitter = emitter;

var cfgPath = __dirname + '/config.json';
if (!fs.existsSync(cfgPath)) {
    throw new Error('[eol-sublistener] config.json was not present in bundles/eol-sublistener, aborting!');
}
var ircConfig = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));

// Lazy-load and lazy-install the node-twitch-irc npm package if necessary
squirrel('node-twitch-irc', function twitchIrcLoaded(err, irc) {
    var client = new irc.connect(ircConfig, function(err, event) {
        if (!err) {
            // "Subscribe" event.
            event.on("subscribe", function onSubscribe(channel, username, resub) {
                var content = { name: username, resub: resub };
                io.sockets.json.send({
                    bundleName: 'eol-sublistener',
                    messageName: 'subscriber',
                    content: content
                });
                emitter.emit('subscriber', content);
            });

            // "Connected" event.
            event.on("connected", function onConnected() {
                console.log('[eol-sublistener] Listening for subscribers...')
            });

            // "Disconnected" event.
            event.on("disconnected", function onDisconnected(reason) {
                console.log('[eol-sublistener] DISCONNECTED: '+reason);
            });
        } else  {
            console.log(err);
        }
    });
});
