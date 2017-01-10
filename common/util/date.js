function DateCalc(date, bef, aft) {
    if (date) {
        this.date = [date.substr(0, 4), '-', date.substr(4, 2), '-', date.substr(-2)].join('')
    } else {
        const d = new Date();
        this.date = [d.getFullYear(), '-', this._cover(d.getMonth() + 1), '-', this._cover(d.getDate())].join('')
    }
    this.bef = bef || 0;
    this.aft = aft || 0;
}

DateCalc.prototype = {
    constructor: DateCalc,

    now: function(date) {
        date && (this.date = [date.substr(0, 4), '-', date.substr(4, 2), '-', date.substr(-2)].join(''));
        const d = this.date ? new Date(this.date) : new Date();
        return [d.getFullYear(), this._cover(d.getMonth() + 1), this._cover(d.getDate())].join('');
    },
    today: function() {
        const d = new Date();
        return [d.getFullYear(), this._cover(d.getMonth() + 1), this._cover(d.getDate())].join('');
    },
    before: function(days) {
        return this._calc(days || 1, 'before');
    },
    after: function(days) {
        return this._calc(days || 1, 'after');
    },
    _calc: function(days, type) {
        const d = new Date(this.date),
            input = 0;
        if (type === 'before') {
            input = 0 - this.bef;
            days = 0 - days;
        } else {
            input = this.aft;
        }
        const total = days || input || 0;

        const newDate = new Date(d.getTime() + 3600 * 24 * 1000 * total);
        return [newDate.getFullYear(), this._cover(newDate.getMonth() + 1), this._cover(newDate.getDate())].join('');
    },
    _cover: function(num) {
        const n = parseInt(num, 10);
        return n < 10 ? '0' + n : n;
    }
};

module.exports = DateCalc;
