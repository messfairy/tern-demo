var fs = require('fs');
fs.readFile('./main.js', function(err, buffer){
    var lineArray = searchLine('require', buffer.toString());
    lineArray.forEach(function(line){
        console.log('line: ' + line.line + ', ch: ' + line.ch + ', text: ' + line.text);
    });
});

function searchLine(target, text){
    var textList = text.split('\n');
    var lineArray = [];
    textList.forEach(function(text, line){
        var ch = text.search(target);
        if(ch>-1) lineArray.push({text: text, ch: ch, line: line});
    });
    return lineArray;
}