// Project imports
var BotPlayer = require('./BotPlayer');
var FakeSocket = require('./FakeSocket');
var PacketHandler = require('../PacketHandler');

function BotLoader(gameServer) {
    this.gameServer = gameServer;
    //this.randomNames = ['', '2ch.hk', '4chan', '8', '8ch', '9gag', 'argentina', 'australia', 'austria', 'ayy lmao', 'bait', 'bangladesh', 'belgium', 'berlusconi', 'blatter', 'boris', 'bosnia', 'botswana', 'brazil', 'bulgaria', 'bush', 'byzantium', 'cambodia', 'cameron', 'canada', 'chaplin', 'chavez', 'chile', 'china', 'cia', 'clinton', 'confederate', 'croatia', 'cuba', 'denmark', 'dilma', 'doge', 'ea', 'earth', 'estonia', 'european union', 'facebook', 'facepunch', 'feminism', 'fidel', 'finland', 'france', 'french kingdom', 'german empire', 'germany', 'greece', 'hillary', 'hollande', 'hong kong', 'hungary', 'imperial japan', 'india', 'indiana', 'indonesia', 'iran', 'iraq', 'ireland', 'irs', 'italy', 'jamaica', 'japan', 'kc', 'kim jong-un', 'MuroagarzFAN','T63-Fan' '', ''];
    this.loadNames();
}

module.exports = BotLoader;

BotLoader.prototype.getName = function() {
    var name = "";
    
    // Picks a random name for the bot
    if (this.gameServer.randomNames.length > 0) {
        var index = Math.floor(Math.random() * this.gameServer.randomNames.length);
        name = this.gameServer.randomNames[index];
        this.gameServer.randomNames.splice(index, 1);
    } else {
        name = "bot" + ++this.nameIndex;
    }

    return name;
};

BotLoader.prototype.loadNames = function() {


    this.nameIndex = 0;
};

BotLoader.prototype.addBot = function() {
    var s = new FakeSocket(this.gameServer);
    s.playerTracker = new BotPlayer(this.gameServer, s);
    s.packetHandler = new PacketHandler(this.gameServer, s);

    // Add to client list
    this.gameServer.clients.push(s);

    // Add to world
    s.packetHandler.setNickname(this.getName());
};
