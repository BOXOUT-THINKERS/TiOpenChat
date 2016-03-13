// https://npmjs.org/package/moment.twitter 참조하여 구현 
var moment = require('alloy/moment');

// Times in millisecond
var second = 1e3, minute = 6e4, hour = 36e5, day = 864e5, week = 6048e5,
  formats = {
    seconds : {
      short : 's',
      long : ' sec'
    },
    minutes : {
      short : 'm',
      long : ' min'
    },
    hours : {
      short : 'h',
      long : ' hr'
    },
    days : {
      short : 'd',
      long : ' day'
    }
  };

var format = function(format) {
  var diff = Math.abs(this.diff(moment()));

  if (diff < week) {
    return this.fromNow();
  } else {
    return this.format('L');
  }
};

moment.fn.twitter = moment.fn.twitterShort = function() {
  return format.call(this, 'short');
};

moment.lang('ko', {
//
    longDateFormat : {
        LT : "A h시 mm분",
        L : "YYYY.MM.DD",
        LL : "YYYY년 MMMM D일",
        LLL : "YYYY년 MMMM D일 LT",
        LLLL : "YYYY년 MMMM D일 dddd LT"
    },

    relativeTime : {
        future : "in %s",
        past : "%s",
        s : "1초",
        ss : "%d초",
        m : "1분",
        mm : "%d분",
        h : "1시간",
        hh : "%d시간",
        d : "1일",
        dd : "%d일",
        M : "1달",
        MM : "%d달",
        y : "1년",
        yy : "%1년"
    }
});

moment.lang('en',{
  longDateFormat : {
        LT : "HH:mm",
        L : "DD/MM/YYYY",
        LL : "D MMMM YYYY",
        LLL : "D MMMM YYYY LT",
        LLLL : "dddd, D MMMM YYYY LT"
   },
       relativeTime : {
        future : "in %s",
        past : "%s",
        s : "1s",
        ss : "%ds",
        m : "1m",
        mm : "%dm",
        h : "1h",
        hh : "%dh",
        d : "1d",
        dd : "%dd",
        M : "1M",
        MM : "%dM",
        y : "1Y",
        yy : "%dY"
  }
});

module.exports = moment;
