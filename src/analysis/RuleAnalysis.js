var RuleAnalyzer = {
    sleep: {
        /*
        sleeptime: function (g, timeranges) {
            return G.average_time(g, () => true, (n) => n.value == "sleep", timeranges);
        },
        //*/
        gotobed: function (g) {
            //return G.average_per_occurrence(g, G. duration, (n) => TimeRange.fromGraph(n).length() >= 7200000);
            return G.average_time_in_day(G.getSleep(g), TimeSchedule.timeFromhms(12), false);
            var a = G.getSleep(g);
            a.shift();
            return (a.reduce((p, v) => p + (TimeSchedule.timeInDay(v.from) + TimeSchedule.timeFromhms(12)) % TimeSchedule.timeFromhms(24), 0) / a.length + TimeSchedule.timeFromhms(12)) % TimeSchedule.timeFromhms(24);
        },
        wakeup: function (g) {
            return G.average_time_in_day(G.getSleep(g), 0, true);
            var a = G.getSleep(g);
            a.pop();
            //alert(a.map((x) => x.to).join("\n"));
            return a.reduce((p, v) => p + TimeSchedule.timeInDay(v.to), 0) / a.length;
        },
        sleepduration: function (g) {
            return ((a) => /*id(true, (a.map((x) => x.from.toString() + "~" + x.to.toString()).join("\n"))) &&*/ a.reduce((p, v) => p + v.length(), 0) / a.length)(G.timeRanges(g, () => true, G.valeq("activity")));
        },
        sleepsperday: function (g, timeranges) {//issue: 연속된 수면 합치기
            return G.timeRanges(g, () => true, G.valeq("sleep"), 60000).length / TimeRange.sumlength(timeranges);
            //return G.listValue(g, TimeRange.fromGraph, () => true, (n) => n.value == "sleep").sort(cmp((a, b) => a.from < b.from)).reduce((p, v, i, a) => p == 0 ? 1 : TimeRange.intersect(v, a[i - 1]) ? p : p + 1, 0) / TimeRange.sumlength(timeranges);
        },
        breakfast: function (g, timeranges) {
            return G.average_per_time(g, () => 1, G.attr("meal_type", "아침"), G.valeq("food"), timeranges);
        },
        weekendwakeup: function (g) {
            return G.average_time_in_day(G.getSleep(g).filter((x) => [0, 6].indexOf(x.from.getDay()) != -1), 0, true);
        },

        mostbreakfastquanti: function (g) {
            var num_to_amount = { "0": "매우 적음", "1": "적음", "2": "많음", "3": "매우 많음" };
            var arr = [0, 0, 0, 0]; var maxIndex = 0;
            arr[0] = G.sum(g, () => 1, (n) => { return G.attr("meal_type", "아침")(n) && G.attr("amount_of_food", "매우 적음")(n) }, G.valeq("food"));
            arr[1] = G.sum(g, () => 1, (n) => { return G.attr("meal_type", "아침")(n) && G.attr("amount_of_food", "적음")(n) }, G.valeq("food"));
            arr[2] = G.sum(g, () => 1, (n) => { return G.attr("meal_type", "아침")(n) && G.attr("amount_of_food", "많음")(n) }, G.valeq("food"));
            arr[3] = G.sum(g, () => 1, (n) => { return G.attr("meal_type", "아침")(n) && G.attr("amount_of_food", "매우 많음")(n) }, G.valeq("food"));
            for (var i = 0; i < 4; i++) if (arr[maxIndex] < arr[i]) maxIndex = i;
            return num_to_amount[maxIndex.toString()];
        },

        mood: function (g) {
            var num_to_emotion = { "0": "매우 부정", "1": "부정", "2": "보통", "3": "긍정", "4" : "매우 긍정" };
            var emotion_to_num = { "매우 부정" : "0", "부정" : "1", "보통" :  "2", "긍정" : "3" , "매우 긍정" : "4"};
            var arr = [0, 0, 0, 0, 0]; var maxIndex = 0;
            var sleeps = G.getSleep(g); var nextEven; //alert(sleeps.length);
            for(tr of sleeps) {
                nextEven = G.nextEvent(g, tr.to, TimeSchedule.timeFromhms(0, 1), (n) => n.value == "food" || n.value == "activity");
                if(nextEven != null) arr[emotion_to_num[nextEven.getChildByAttr("emotion").value]]++;
            }
            for (var i = 0; i < 5; i++) {
                if (arr[maxIndex] < arr[i]) maxIndex = i; //alert(arr[i]);
            }
            return num_to_emotion[maxIndex];
        },

        actibeforebed: function (g) {

        },

        commutetime: function (g) {

        }
    },
    food: {
        /*
        foodtime: function (g) {
            return G.average_per_occurrence(g, G.duration, () => true, (n) => n.value == "food");
        },
        //*/
        yasik: function (g, timeranges) {
            function day(d) {
                return 10000 * d.getFullYear() + 100 * d.getMonth() + d.getDate();
            }
            //var sc = new TimeSchedule(TimeSchedule.timeFromhms(21), TimeSchedule.timeFromhms(3));
            //return G.timeRanges(g, (n) => sc.contains(new Date(n.value)), G.valeq("food"), 60000).map((n) => day(n.from)).reduce((p, v, i, a) => i == 0 ? 1 : v == a[i - 1] ? p : p + 1, 0) / Test.i(TimeRange.sumlength(timeranges));
            return G.timeRanges(g, G.attr("meal_type", "야식"), G.valeq("food"), TimeSchedule.timeFromhms(2)).map((n) => day(n.from)).length / Test.i(TimeRange.sumlength(timeranges));
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
            var num_to_hunger = { "0": "아니오", "1": "예"};
            var hunger_to_num = { "아니오": "0", "예": "1"};
            var arr = [0, 0];
            var sleeps = G.getSleep(g); var nextEven;
            for(tr of sleeps) {
                nextEven = G.nextEvent(g, tr.to, TimeSchedule.timeFromhms(0, 1), (n) => n.value == "food" || n.value == "activity");
                if (nextEven != null) arr[hunger_to_num[nextEven.getChildByAttr("hunger").value]]++;
            }
            alert("arr[0]: " + arr[0] + "\narr[1]: " + arr[1]);
            return (arr[0] * (-1) + arr[1] * 1) / (arr[0] + arr[1]);
        },

        startsleep: function (g) {
            return G.average_time_in_day(G.getSleep(g), TimeSchedule.timeFromhms(12), false);
            var a = G.getSleep(g);
            a.shift();
            return (a.reduce((p, v) => p + (TimeSchedule.timeInDay(v.from) + TimeSchedule.timeFromhms(12)) % TimeSchedule.timeFromhms(24), 0) / a.length + TimeSchedule.timeFromhms(12)) % TimeSchedule.timeFromhms(24);
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
            return Test.i(G.average_time(g, G.attr("activity", "사교"), G.valeq("activity"), timeranges));
        },
        gohome: function (g) {
            return G.average_time_in_day(G.timeRanges(g, G.attr("place", "집"), () => true, TimeSchedule.timeFromhms(3)), TimeSchedule.timeFromhms(12), false);
            var a = G.timeRanges(g, G.attr("place", "집"), () => true, TimeSchedule.timeFromhms(3));
            a.shift();
            return (a.reduce((p, v) => p + (TimeSchedule.timeInDay(v.from) + TimeSchedule.timeFromhms(12)) % TimeSchedule.timeFromhms(24), 0) / a.length + TimeSchedule.timeFromhms(12)) % TimeSchedule.timeFromhms(24);
        },
        stayhome: function (g, timeranges) {
            return G.average_time(g, G.attr("place", "집"), () => true, timeranges);
        },
        together: function (g, timeranges) {
            return G.average_time(g, (n) => ((x) => ["", "/", "혼자"].every((y) => y != x))(n.getChildByAttr("person").value), () => true, timeranges);
        },
        move: function (g, timeranges) {
            return G.average_time(g, G.attr("activity", "이동"), G.valeq("activity"), timeranges);
        },
        restocafe: function (g, timeranges) {
            return G.average_time(g, (n) => n.getChildByAttr("place").value.split("|").some((x) => x == "식당" || x == "카페"), () => true, timeranges);
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
