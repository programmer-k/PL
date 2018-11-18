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
        //자기 전에 가장 많이 한 상위 10개 이하의 활동을 배열로 반환
        actibeforebed: function (g) {
            var activities = {};
            var sleeps = G.getSleep(g); var lastEven;
            for(tr of sleeps) {
                lastEven = G.lastEvent(g, tr.from, TimeSchedule.timeFromhms(0, 1), (n) => n.value == "food" || n.value == "activity");
                if (lastEven != null) {
                    var split_activity = lastEven.getChildByAttr("activity").value.split("|");
                    for(value of split_activity) 
                        if (!(activities.hasOwnProperty(value)))
                            activities[value] = 1;
                        else
                            activities[value]++;
                }
            }
            var arr=[];
            for(key in activities) {
                var subarr = [];
                subarr.push(key); subarr.push(activities[key]);
                arr.push(subarr);
            }
            arr.sort(function (a, b) { return a[1] > b[1] ? -1 : a[1] < b[1] ? 1 : 0; });
            var topActivities=[];
            for (var i = 0; i < 10 && i < arr.length; i++) topActivities.push(arr[i][0]);
            return topActivities;
            /*var keys = Object.keys(activities); var maxActivity = keys[0];
            for (key of keys) {
                if (activities[maxActivity] < activities[key]) maxActivity = key;
            }
            return maxActivity*/
        },

        // 평균 통근하는데 걸리는 시간을 밀리세컨 단위로 반환
        commutetime: function (g) {

            var cTime = [];
            var sleeps = G.getSleep(g); var moves = G.getMove(g);
            var cDuration;
            for(s of sleeps) {
                cDuration = null;
                for(m of moves) {
                    if (s.to <= m.from && m.from - s.to <= TimeSchedule.timeFromhms(3)) {
                        if (cDuration == null) cDuration = m;
                        else if (cDuration.to - cDuration.from < m.to - m.from) cDuration = m;
                    }
                }
                if (cDuration != null) cTime.push(cDuration);
            }
            var cTimeSum = 0;
            for(tr of cTime) {
                cTimeSum += tr.to - tr.from;
            }
            return cTimeSum / cTime.length;
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
            return G.getYasik(g).map((n) => day(n.from)).length / Test.i(TimeRange.sumlength(timeranges));
        },
        //야식 중 식사량이 '많음' 이상인 비율 반환
        avgmanyfood: function (g) {
            var yasikTr = G.getYasik(g);
            var yasiks = G.listValue(g, (n)=>n, G.attr("meal_type","야식"), G.valeq("food"));
            var yasikManyCount = 0;
            for(tr of yasikTr) {
                var arr = []; var start= (new Date(tr.from)).getTime(); var end = (new Date(tr.to)).getTime();
                for(yasik of yasiks) {
                    var time = (new Date(yasik.value)).getTime();
                    if (time >= start && time <= end) arr.push(yasik);
                }
                for(e of arr) {
                    if (e.getChildByAttr("amount_of_food").value == "많음" || e.getChildByAttr("amount_of_food").value == "매우 많음")
                        yasikManyCount++; break;
                }
            }
            return yasikTr.length==0? "야식을 먹지 않음": yasikManyCount / yasikTr.length;
        },

        // 야식으로 먹은 음식중 가장 많이 먹은 음식 상위 3개 이하의 배열 반환
        favofood: function (g) {
            var yasikType = {};
            var yasiks = G.listValue(g, (n)=>n, G.attr("meal_type","야식"), G.valeq("food"));
            for(node of yasiks) {
                var split_Food = node.getChildByAttr("food").value.split("|");
                for(val of split_Food) {
                    if(!yasikType.hasOwnProperty(val)) yasikType[val]=1;
                    else yasikType[val]++;
                }
            }
            var arr=[];
            for (food in yasikType) {
                var subarr=[];
                subarr.push(food); subarr.push(yasikType[food]);
                arr.push(subarr);
            }
            arr.sort(function (a, b) { return a[1] > b[1] ? -1 : a[1] < b[1] ? 1 : 0; });
            var topFood=[];
            for(var i=0; i<3 && i<arr.length; i++) topFood.push(arr[i][0]);
            return topFood.length == 0 ? "야식을 먹지 않음" : topFood;
        },
        // 저녁과 저녁으로부터 12시간 내에 먹은 야식 간의 평균 시간 차이를 밀리세컨 단위로 반환
        diffdinneryasik: function (g, timeranges) {
            var dinners = G.listValue(g, (n) =>n, G.attr("meal_type", "저녁"), G.valeq("food"));
            var yasikTr = G.getYasik(g);
            var twelveHours = TimeSchedule.timeFromhms(12);
            var earliestYasik; var diffs=[];
            for(dinner of dinners) {
                var dinnerEndTime = (new Date(dinner.getChildByAttr("end_time").value)).getTime();
                earliestYasik=null;
                for(tr of yasikTr) {
                    var yasikStartTime = (new Date(tr.from)).getTime();
                    if (dinnerEndTime <= yasikStartTime && yasikStartTime - dinnerEndTime <= twelveHours) {
                        if (earliestYasik == null || earliestYasik>yasikStartTime) earliestYasik = yasikStartTime;
                    }
                }
                if (earliestYasik != null) diffs.push(earliestYasik - dinnerEndTime);
            }
            return (dinners.length==0 || yasikTr.length==0)? null : diffs.reduce((p, v) =>p + v, 0) / diffs.length;
        },

        mostdinnerquanti: function (g) {
            var num_to_amount = { "0": "매우 적음", "1": "적음", "2": "많음", "3": "매우 많음" };
            var amount_to_num = { "매우 적음": "0", "적음": "1", "많음": "2", "매우 많음": "3" };
            var dinnersAmount = G.listValue(g, (n) => { return n.getChildByAttr("amount_of_food").value }, G.attr("meal_type", "저녁"), G.valeq("food"));
            var arr = [0, 0, 0, 0];
            for(amount of dinnersAmount) arr[amount_to_num[amount]]++;
            var maxIndex = 0;
            for (var i = 0; i < 4; i++) if (arr[maxIndex] < arr[i]) maxIndex = i;
            return dinnersAmount.length == 0 ? "저녁을 먹지 않음" : num_to_amount[maxIndex];
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
            return (arr[0] * (-1) + arr[1] * 1) / (arr[0] + arr[1]);
        },

        startsleep: function (g) {
            return G.average_time_in_day(G.getSleep(g), TimeSchedule.timeFromhms(12), false);
            var a = G.getSleep(g);
            a.shift();
            return (a.reduce((p, v) => p + (TimeSchedule.timeInDay(v.from) + TimeSchedule.timeFromhms(12)) % TimeSchedule.timeFromhms(24), 0) / a.length + TimeSchedule.timeFromhms(12)) % TimeSchedule.timeFromhms(24);
        },
        // 야식을 제외한 식사의 평균 식사량을 -2~2의 범위의 숫자로 반환
        avgquanti: function (g) {
            var num_to_amount = { "0": "매우 적음", "1": "적음", "2": "많음", "3": "매우 많음" };
            var amount_to_num = { "매우 적음": "0", "적음": "1", "많음": "2", "매우 많음": "3" };
            var mealsAmount = G.listValue(g, (n) => n.getChildByAttr("amount_of_food").value, (n) => !(G.attr("meal_type", "야식")(n)) && n.getChildByAttr("amount_of_food")!=null, G.valeq("food"));
            var arr = [0, 0, 0, 0];
            for(amount of mealsAmount) arr[amount_to_num[amount]]++;
            return mealsAmount.length == 0 ? null : (arr[0] * (-2) + arr[1] * (-1) + arr[2] * 1 + arr[3] * 2) / mealsAmount.length;
        },

        diffmood: function (g) {
            var emotion_to_num = { "매우 부정": -2, "부정": -1, "보통": 0, "긍정": 1, "매우 긍정": 2 };
            var emotion_sum_yasik = G.sum(g, (n) => emotion_to_num[n.getChildByAttr("emotion").value], (n) => G.attr("meal_type", "야식")(n), G.valeq("food"));
            var emotion_sum_after_yasik = G.sum(g, (n) => emotion_to_num[G.nextEvent(g, n.getChildByAttr("end_time").value, TimeSchedule.timeFromhms(0, 1), () => true).getChildByAttr("emotion").value], (n) => G.attr("meal_type", "야식")(n), G.valeq("food"));
            var emotion_num = G.sum(g, () => 1, (n) => G.attr("meal_type", "야식")(n) || G.attr("meal_type", "야식")(n), G.valeq("food"));

            // alert(emotion_sum_yasik);
            // alert(emotion_sum_after_yasik);
            // alert(emotion_num);

            return emotion_num==0? "야식을 먹지 않음":(emotion_sum_yasik - emotion_sum_after_yasik) / emotion_num;
        },

        timetosleep: function (g) {
            var yasikTr = G.getYasik(g);
            var sleepTr = G.getSleep(g);
            var twelveHours = TimeSchedule.timeFromhms(12);
            var earliestSleep; var diffs = [];
            for(ytr of yasikTr) {
                var yasikEndTime = (new Date(ytr.to)).getTime();
                earliestSleep = null;
                for(str of sleepTr) {
                    var sleepStartTime = (new Date(str.from)).getTime();
                    if (yasikEndTime <= sleepStartTime && sleepStartTime - yasikEndTime <= twelveHours) {
                        if (earliestSleep == null || earliestSleep > sleepStartTime) earliestSleep = sleepStartTime;
                    }
                }
                if (earliestSleep != null) diffs.push(earliestSleep - yasikEndTime);
            }
            return (yasikTr.length == 0 || sleepTr.length == 0) ? null : diffs.reduce((p, v) =>p + v, 0) / diffs.length;
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
            return G.average_per_time(g, () => 1, (n) => { return G.attr("activity", "야외활동")(n) || G.attr("activity", "능동적 여가")(n); }, G.valeq("activity"), timeranges);
            return G.average_per_time(g, () => 1, G.attr("meal_type", "아침"), G.valeq("food"), timeranges);
        },

        avgmood: function (g) {
            var emotion_to_num = { "매우 부정": -2, "부정": -1, "보통": 0, "긍정": 1, "매우 긍정": 2 };
            var emotion_sum = G.sum(g, (n) => emotion_to_num[n.getChildByAttr("emotion").value], (n) => G.attr("person", "친밀한 관계")(n) || G.attr("person", "데면한 관계")(n), () => true);
            var emotion_num = G.sum(g, () => true, (n) => G.attr("person", "친밀한 관계")(n) || G.attr("person", "데면한 관계")(n), () => true);

            return emotion_sum / emotion_num;
        },

        diffmood: function (g) {
            var emotion_to_num = { "매우 부정": -2, "부정": -1, "보통": 0, "긍정": 1, "매우 긍정": 2 };
            var emotion_sum_friendly = G.sum(g, (n) => emotion_to_num[n.getChildByAttr("emotion").value], (n) => G.attr("person", "친밀한 관계")(n), () => true);
            var emotion_sum_not_f = G.sum(g, (n) => emotion_to_num[n.getChildByAttr("emotion").value], (n) => G.attr("person", "데면한 관계")(n), () => true);
            var emotion_num = G.sum(g, () => true, (n) => G.attr("person", "친밀한 관계")(n) || G.attr("person", "데면한 관계")(n), () => true);

            return (emotion_sum_friendly - emotion_sum_not_f) / emotion_num;
        },

        diffmealquanti: function (g) {
            var num_to_amount = { "0": "매우 적음", "1": "적음", "2": "많음", "3": "매우 많음" };
            var amount_to_num = { "매우 적음": "0", "적음": "1", "많음": "2", "매우 많음": "3" };
            var aloneAmount = G.listValue(g, (n) =>n.getChildByAttr("amount_of_food").value,
                (n) => n.getChildByAttr("person") != null && n.getChildByAttr("person").value == "혼자" && n.getChildByAttr("amount_of_food") != null, G.valeq("food"));
            var withAmount = G.listValue(g, (n) =>n.getChildByAttr("amount_of_food").value,
                (n) => n.getChildByAttr("person") != null && n.getChildByAttr("person").value != "혼자" && n.getChildByAttr("amount_of_food") != null, G.valeq("food"));
            var aloneArr = [0,0,0,0];
            for(amount of aloneAmount) aloneArr[amount_to_num[amount]]++;
            var withArr = [0, 0, 0, 0];
            for(amount of withAmount) withArr[amount_to_num[amount]]++;
            return (aloneAmount.length == 0 || withAmount.length == 0) ? "늘 혼자 먹거나 늘 다른 사람과 같이 먹음" :
                (aloneArr[0] * (-2) + aloneArr[1] * (-1) + aloneArr[2] * 1 + aloneArr[3] * 2) / aloneAmount.length -
                (withArr[0] * (-2) + withArr[1] * (-1) + withArr[2] * 1 + withArr[3] * 2) / withAmount.length;
        }
    }
};
