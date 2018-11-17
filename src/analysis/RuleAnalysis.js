var RuleAnalyzer = {
    sleep: {
        /*
        sleeptime: function (g, timeranges) {
            return Average.average_time(g, () => true, (n) => n.value == "sleep", timeranges);
        },
        //*/
        gotobed: function (g) {
            //return Average.average_per_occurrence(g, GraphFunctions. duration, (n) => TimeRange.fromGraph(n).length() >= 7200000);
            return Average.average_time_in_day(SearchGraph.getSleep(g), TimeSchedule.timeFromhms(12), false);
            var a = SearchGraph.getSleep(g);
            a.shift();
            return (a.reduce((p, v) => p + (TimeSchedule.timeInDay(v.from) + TimeSchedule.timeFromhms(12)) % TimeSchedule.timeFromhms(24), 0) / a.length + TimeSchedule.timeFromhms(12)) % TimeSchedule.timeFromhms(24);
        },
        wakeup: function (g) {
            return Average.average_time_in_day(SearchGraph.getSleep(g), 0, true);
            var a = SearchGraph.getSleep(g);
            a.pop();
            //alert(a.map((x) => x.to).join("\n"));
            return a.reduce((p, v) => p + TimeSchedule.timeInDay(v.to), 0) / a.length;
        },
        sleepduration: function (g) {
            return ((a) => /*id(true, (a.map((x) => x.from.toString() + "~" + x.to.toString()).join("\n"))) &&*/ a.reduce((p, v) => p + v.length(), 0) / a.length)(SearchGraph.timeRanges(g, () => true, GraphFunctions.valeq("activity")));
        },
        sleepsperday: function (g, timeranges) {//issue: 연속된 수면 합치기
            return SearchGraph.timeRanges(g, () => true, GraphFunctions.valeq("sleep"), 60000).length / TimeRange.sumlength(timeranges);
            //return SearchGraph.listValue(g, TimeRange.fromGraph, () => true, (n) => n.value == "sleep").sort(cmp((a, b) => a.from < b.from)).reduce((p, v, i, a) => p == 0 ? 1 : TimeRange.intersect(v, a[i - 1]) ? p : p + 1, 0) / TimeRange.sumlength(timeranges);
        },
        breakfast: function (g, timeranges) {
            return Average.average_per_time(g, () => 1, GraphFunctions.attr("meal_type", "아침"), GraphFunctions.valeq("food"), timeranges);
        },
        weekendwakeup: function (g) {
            return Average.average_time_in_day(SearchGraph.getSleep(g).filter((x) => [0, 6].indexOf(x.from.getDay()) != -1), 0, true);
        },

        mostbreakfastquanti: function (g) {

        },

        mood: function (g) {

        },

        actibeforebed: function (g) {

        },

        commutetime: function (g) {

        }
    },
    food: {
        /*
        foodtime: function (g) {
            return Average.average_per_occurrence(g, GraphFunctions.duration, () => true, (n) => n.value == "food");
        },
        //*/
        yasik: function (g, timeranges) {
            function day(d) {
                return 10000 * d.getFullYear() + 100 * d.getMonth() + d.getDate();
            }
            var sc = new TimeSchedule(TimeSchedule.timeFromhms(21), TimeSchedule.timeFromhms(3));
            return SearchGraph.timeRanges(g, (n) => sc.contains(new Date(n.value)), GraphFunctions.valeq("food"), 60000).map((n) => day(n.from)).reduce((p, v, i, a) => i == 0 ? 1 : v == a[i - 1] ? p : p + 1, 0) / Test.i(TimeRange.sumlength(timeranges));
        },

        avgmanyfood: function (g, timeranges) {

        },

        favofood: function (g) {

        },

        diffdinneryasik: function (g, timeranges) {

        },

        mostdinnerquanti: function (g) {

        },

        wakeuphunger: function (g) {

        },

        startsleep: function (g) {

        },

        avgquanti: function (g) {

        },

        diffmood: function (g) {

        },

        timetosleep: function (g) {

        }
    },
    life: {
        sagyo: function (g, timeranges) {
            return Test.i(Average.average_time(g, GraphFunctions.attr("activity", "사교"), GraphFunctions.valeq("activity"), timeranges));
        },
        gohome: function (g) {
            return Average.average_time_in_day(SearchGraph.timeRanges(g, GraphFunctions.attr("place", "집"), () => true, TimeSchedule.timeFromhms(3)), TimeSchedule.timeFromhms(12), false);
            var a = SearchGraph.timeRanges(g, GraphFunctions.attr("place", "집"), () => true, TimeSchedule.timeFromhms(3));
            a.shift();
            return (a.reduce((p, v) => p + (TimeSchedule.timeInDay(v.from) + TimeSchedule.timeFromhms(12)) % TimeSchedule.timeFromhms(24), 0) / a.length + TimeSchedule.timeFromhms(12)) % TimeSchedule.timeFromhms(24);
        },
        stayhome: function (g, timeranges) {
            return Average.average_time(g, GraphFunctions.attr("place", "집"), () => true, timeranges);
        },
        together: function (g, timeranges) {
            return Average.average_time(g, (n) => ((x) => ["", "/", "혼자"].every((y) => y != x))(n.getChildByAttr("person").value), () => true, timeranges);
        },
        move: function (g, timeranges) {
            return Average.average_time(g, GraphFunctions.attr("activity", "이동"), GraphFunctions.valeq("activity"), timeranges);
        },
        restocafe: function (g, timeranges) {
            return Average.average_time(g, (n) => n.getChildByAttr("place").value.split("|").some((x) => x == "식당" || x == "카페"), () => true, timeranges);
        },

        avgexerhobout: function (g, timeranges) {

        },

        avgmood: function (g) {

        },

        diffmood: function (g) {

        },

        diffmealquanti: function (g) {

        }
    }
};
