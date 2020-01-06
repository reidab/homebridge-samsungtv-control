const remote = require('samsung-remote');
const { exec } = require('child_process');

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
    constructor(log, ipaddress, cecId = 0) {
        this.log = log;
        this.ip = ipaddress;
        this.cecId = cecId;

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
        const isOn = on === 1;

        const execHandler = (error, _stdout, _stderr) => {
          if (error) {
            this.log.error(`cec-client error: ${error}`);
            callback(error);
          }
        };

        if (isOn) {
          exec(`echo 'on ${this.cecId}' | cec-client -s -d 1`, execHandler);
        } else {
          exec(`echo 'standby ${this.cecId}' | cec-client -s -d 1`, execHandler);
        }
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
