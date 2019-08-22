const remote = require('samsung-remote');

const keyMapping = {
    0: 'KEY_REWIND',
    1: 'KEY_FF',
    2: 'KEY_FF',
    3: 'KEY_REWIND',
    4: 'KEY_UP',
    5: 'KEY_DOWN',
    6: 'KEY_LEFT',
    7: 'KEY_RIGHT',
    8: 'Enter',
    9: 'KEY_RETURN',
    10: 'KEY_HOME',
    11: 'KEY_PLAY',
    15: 'KEY_INFO'
};

const inputMapping = {
    1: 'KEY_TV',
    2: 'KEY_HDMI1',
    3: 'KEY_HDMI2',
    4: 'KEY_HDMI3',
    5: 'KEY_HDMI4'
};

class SamsungAPI {
    constructor(log, ipaddress) {
        this.log = log;
        this.ip = ipaddress;

        this.remote = new remote({
            ip: this.ip
        });
    }

    isOn(callback) {
        this.remote.isAlive(err => {
            callback(null, !err);
        });
    }

    setState(on, callback) {
        let isOn = on === 1;

        this.remote.isAlive(err => {
            if (err && isOn) {
                this.log.warn('Device unreachable');
                callback(err);
            } else if (isOn) {
                this.sendCommand('KEY_POWEROFF', callback);
            } else {
                this.sendCommand('KEY_POWERON', callback);
            }
        });
    }

    changeVolume(volumeDown, callback) {
        this.sendCommand(volumeDown ? "KEY_VOLDOWN" : "KEY_VOLUP", callback);
    }

    setMute(callback) {
        this.sendCommand("KEY_MUTE", callback);
    }

    sendKey(key, callback) {
        this.sendCommand(keyMapping[key], callback);
    }

    setInput(input, callback) {
        this.sendCommand(inputMapping[input], callback);
    }

    sendCommand(command, callback) {
        this.remote.send(command, function (err) {
            if (err) {
                this.log.error('Failed sending %s', command, err);
                callback(err);
            } else {
                callback(null);
            }
        }.bind(this));
    }
}

module.exports = {
    SamsungAPI
};
