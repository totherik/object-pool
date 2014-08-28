(function () {

    function padRight(str, char, count) {
        while (str.length < count) {
            str += char;
        }
        return str;
    }

    function padLeft(str, char, count) {
        while (str.length < count) {
            str = char + str;
        }
        return str;
    }

    function add(a, b) {
        return a + b;
    }

    function sub(a, b) {
        return a - b;
    }

    TS.channels.onSendMsg = (function (original) {
        return function (ok, msg) {
            var channel, count, max, dir, emoji;

            emoji = ':crab:';
            if (ok && msg.text === emoji) {
                channel = TS.channels.getChannelById(msg.SENT_MSG.channel);
                count = 0;
                max = 25;

                (function walk() {
                    var text;
                    text = emoji;
                    text = padLeft(text, '_', count + emoji.length);
                    text = padRight(text, '_', max + emoji.length);
                    TS.msg_edit.commitEdit(msg, channel, text);

                    if (count === max) {
                        dir = sub;
                    } else if (count === 0) {
                        dir = add;
                    }

                    count = dir(count, 1);
                    setTimeout(walk, 250);
                })();
            }
            return original.apply(this, arguments);
        };
    }(TS.channels.onSendMsg));
}());

//(function () {
//    var emojis = Object.keys(emoji.map.colons);
//
//    function getRandomEmoji() {
//        var randomIdx = Math.floor(Math.random() * emojis.length);
//        return ':' + emojis[randomIdx] + ':';
//    }
//
//    function replaceTextRandom(msg) {
//        emoji.init_colons();
//        msg = emoji.replace_emoticons_with_colons(msg);
//        return msg.replace(emoji.rx_colons, function (colonEmoji) {
//            var emojiKey = colonEmoji.substr(1, colonEmoji.length-2);
//            var replacement = emoji.map.colons[emojiKey];
//            return replacement ? getRandomEmoji() : colonEmoji;
//        });
//    }
//
//    TS.channels.onSendMsg = (function (original) {
//        return function (ok, msg) {
//            var channel;
//            if (ok) {
//                channel = TS.channels.getChannelById(msg.SENT_MSG.channel);
//                setTimeout(function () {
//                    var newText = replaceTextRandom(msg.text);
//                    if (newText !== msg.text) {
//                        TS.msg_edit.commitEdit(msg, channel, newText);
//                    }
//                }, 2000);
//            }
//            return original.apply(this, arguments);
//        };
//    }(TS.channels.onSendMsg));
//}());