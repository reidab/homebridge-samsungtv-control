const remote = require('samsung-remote');
const { exec } = require('child_process');

const baseKeyMapping = {
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

const channelKeyMapping = {
  ...baseKeyMapping,
  4: 'KEY_CHUP',
  5: 'KEY_CHDOWN'
}

const inputMapping = {
    1: 'KEY_TV',
    2: 'KEY_HDMI1',
    3: 'KEY_HDMI2',
    4: 'KEY_HDMI3',
    5: 'KEY_HDMI4'
};

class SamsungAPI {
    constructor(log, ipaddress, cecId = 0, powerManagement = 'remote', remoteMode = 'default') {
        this.log = log;
        this.ip = ipaddress;
        this.powerManagement = powerManagement;
        this.cecId = cecId;
        this.keyMapping = remoteMode === 'channel' ? channelKeyMapping : baseKeyMapping;

        this.remote = new remote({
            ip: this.ip
        });
    }

    isOn(callback) {
        this.remote.isAlive(err => {
            callback(null, !err);
        });
    }

    setPowerState(powerState, callback) {
        if (this.powerManagement == 'cec') {
            this.setPowerCec(powerState, callback);
        } else {
            this.setPowerRemote(powerState, callback);
        }
    }

    setPowerRemote(powerState, callback) {
        const turnOn = powerState === 1;

        this.remote.isAlive(err => {
            if (err && turnOn) {
                this.log.error('Device unreachable. Not turning on');
                callback(err);
            } else if (err && !turnOn) {
                this.log.warn('Device unreachable. Not turning off');
                callback();
            } else {
                this.sendCommand(turnOn ? 'KEY_POWERON' : 'KEY_POWEROFF', callback);
            }
        });
    }

    setPowerCec(powerState, callback) {
        this.sendCecCommand(
            powerState === 1 ? 'on' : 'standby',
            callback
        );
    }

    changeVolume(volumeDown, callback) {
        this.sendCommand(volumeDown ? "KEY_VOLDOWN" : "KEY_VOLUP", callback);
    }

    setMute(callback) {
        this.sendCommand("KEY_MUTE", callback);
    }

    sendKey(key, callback) {
        this.sendCommand(this.keyMapping[key], callback);
    }

    setInput(input, callback) {
        this.sendCommand(inputMapping[input], callback);
    }

    sendCommand(command, callback) {
        this.log('Sending remote %s', command);

        this.remote.send(command, function (err) {
            if (err) {
                this.log.error('Failed sending %s', command, err);
                callback(err);
            } else {
                callback(null);
            }
        }.bind(this));
    }

    sendCecCommand(command, callback) {
        this.log('Sending CEC %s', command);

        exec(`echo '${command} ${this.cecId}' | cec-client -s -d 1`, (error, stdout, stderr) => {
            if (error) {
                this.log.error(`cec-client error: ${error}`);
                this.log.error(stdout);
                this.log.error(stderr);
                callback(error);
            }
        });
    }
}

module.exports = {
    SamsungAPI
};
