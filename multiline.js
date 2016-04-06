'use strict';
var stripIndent = function (str) {
  var match = str.match(/^[ \t]*(?=\S)/gm);

  if (!match) {
    return str;
  }

  var indent = Math.min.apply(Math, match.map(function (el) {
    return el.length;
  }));

  var re = new RegExp('^[ \\t]{' + indent + '}', 'gm');

  return indent > 0 ? str.replace(re, '') : str;
};

// start matching after: comment start block => ! or @preserve => optional whitespace => newline
// stop matching before: last newline => optional whitespace => comment end block
var reCommentContents = /\/\*!?(?:\@preserve)?[ \t]*(?:\r\n|\n)([\s\S]*?)(?:\r\n|\n)[ \t]*\*\//;

//引入lodash编译，text返回indent，template返回编译模板函数
var multiline = module.exports = function (fn) {
  if (typeof fn !== 'function') {
    throw new TypeError('Expected a function');
  }

  var match = reCommentContents.exec(fn.toString());

  if (!match) {
    throw new TypeError('Multiline comment missing.');
  }

  return match[1];
};

multiline.stripIndent = function (fn) {
  return stripIndent(multiline(fn));
};

var abcf = function(){/*@preserve
 hahahahahha
 zhdflj
 fkldkf
 */return 'template'};
var abc = multiline.stripIndent(abcf);

var adcf = function(){/*@preserve
 hahahahahha
 zhdflj
 fkldkf
 */return 'text'};

var adc = multiline(adcf);
console.log(abcf.toString());
console.log(abcf());
console.log(abc);
console.log(abc.length);
console.log();
console.log(adcf.toString());
console.log(adcf());
console.log(adc);
console.log(adc.length);
