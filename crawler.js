var https   = require('https'); //对于https 要用https模块
var cheerio = require('cheerio');
var fs      = require('fs');
var path    = require('path');

var horoscopes = [
    // 'aries',
    // 'taurus',
    // 'gemini',
    // 'cancer',
    // 'leo',
    // 'virgo',
    // 'libra',
    // 'scorpio',
    // 'sagittarius',
    // 'capricorn',
    // 'aquarius',
    'pisces',
];

Date.prototype.format=function () {
        var s='';
        s+=this.getFullYear()+'-';          // 获取年份。
        s+=(this.getMonth()+1)+"-";         // 获取月份。
        s+= this.getDate();                 // 获取日。
        return(s);                          // 返回日期。
    };

function getDayAll(begin, end) {
    var dateAllArr = new Array();
    var dateBegin  = new Date(begin);
    var dateEnd    = new Date(end);

    var unixDb = dateBegin.getTime();
    var unixDe = dateEnd.getTime();
    for(var k=unixDb; k<=unixDe;){
        dateAllArr.push((new Date(parseInt(k))).format().toString());
         k= k+24*60*60*1000;
    }
    return dateAllArr;
}

function formatUrl(){
    var days = getDayAll('2018-01-01', '2018-12-31');
    for(var i=0; i<horoscopes.length; i++) {
        for(var j=0; j<days.length; j++) {
            var horo = horoscopes[i];
            var day  = days[j];
            var url = "https://www.astrolis.com/horoscopes/"+horo+"/daily/"+day;
            get(url, horo, day);
            console.log(url+"\n");
            sleep(1000);
        }
    }
}

// 睡眠时间
function sleep(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime)
            return;
    }
}

function get(url, horo, day){
    https.get(url, function(res){
        var html = '';

        res.on('data', function(content){ //获取页面数据
            html += content;
        });

        res.on('end', function(){ //获取数据结束
            var overview = filterOverview(html);
            appendToFile(overview, horo, day);
        });

    }).on('error', function(){
        console.log('get data error');
    });
}

// 提取需要的数据
function filterOverview(html){
    if(html){
        var $ = cheerio.load(html);
        var descripDom = $('span[itemprop="articleBody"]');
        var overview = descripDom.text();

        return overview;
    } else {
        console.log('without input content');
    }
}

function appendToFile(overview, horo, day) {
    var des = overview.replace(/^\s+|\s+$|[\r\n]/g,"");
    var item  = {};
    item[day] = des;

    var row = JSON.stringify(item);
    fs.writeFile(path.join(__dirname, '/data', horo + '.json'), row + "\n", { 'flag': 'a' }, function(error) {  //文件不存在会创建一个,并且是追加模式
        if(error){
            console.log(error);
            return false;
        }
        console.log('写入成功');
    })
}

formatUrl();