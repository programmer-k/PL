function TimeSchedule(from, to) {
    this.from = from;
    this.to = to;
}

TimeSchedule.timeInDay = function (d) {
    return d.getHours() * 3600000 + d.getMinutes() * 60000 + d.getSeconds() * 1000 + d.getMilliseconds();
};
TimeSchedule.timeFromhms = function (h, m, s, ms) {
    return h * 3600000 + (m ? m : 0) * 60000 + (s ? s : 0) * 1000 + (ms ? ms : 0);
};
TimeSchedule.fromDate = function (from, to) {
    return new TimeSchedule(TimeSchedule.timeInDay(from), TimeSchedule.timeInDay(to));
};
TimeSchedule.fromNode = function (n) {
    return TimeSchedule.fromDate(new Date(n.value), new Date(n.getChildByAttr("end_time").value));
}

TimeSchedule.prototype.contains = function (d) {
    var t = TimeSchedule.timeInDay(d);
    //alert([this.from / 3600000, t / 3600000, this.to / 3600000]);
    return this.from < this.to ? t >= this.from && t <= this.to :
        (t >= this.from || t <= this.to);
};

TimeSchedule.day = Test.i(TimeSchedule.timeFromhms(24));
TimeSchedule.week = TimeSchedule.timeFromhms(24 * 7);
