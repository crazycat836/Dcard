var KeywordFilter = require('keyword-filter');
var filter = new KeywordFilter();
 
var keyArrays = ['go', 'js', 'lang', '我哈', '你呀'];
 
filter.init(keyArrays);
var content = 'what is the best lang, go or js?你呀个妹，咿呀我哈噶';
 
console.log(filter.hasKeyword(content));
