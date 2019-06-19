import lang from '../lang';
import {Text} from "react-native";
import React from 'react';
import TimeAgo from 'react-timeago'
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter'

const formatter = buildFormatter({
    prefixAgo: null,
    prefixFromNow: null,
    suffixAgo: lang.t('ago'),
    suffixFromNow: lang.t('from_now'),
    seconds: lang.t('just_now'),
    minute: lang.t('about_a_minute'),
    minutes: lang.t('d_minutes'),
    hour: lang.t('about_an_hour'),
    hours: lang.t('about_d_hours'),
    day: lang.t('a_day'),
    days: lang.t('d_days'),
    month: lang.t('about_a_month'),
    months: lang.t('d_months'),
    year: lang.t('a_year'),
    years: lang.t('d_years'),
    wordSeparator: ' ',
});

class Time {
    format(value) {
        if (value === undefined) return;
        let timeValue = value.split(":");
        let {time,text} = timeValue;

        return timeValue[0] + ' ' + this.formatText(timeValue[1])
    }

    ago(value) {
        return (<TimeAgo formatter={formatter}
            component={Text}
            date={value}
        />);
    }

    getGreetingTime () {
        var today = new Date();
        var curHr = today.getHours();

        if (curHr < 12) {
            return lang.t("morning");
        } else if (curHr < 18) {
            return lang.t("afternoon");
        } else {
            return lang.t("evening");
        }
    }

    getDay(time) {

        let date = new Date(parseInt(time) * 1000);

        return date.getDate();
    }

    getHour(time) {
        let date = new Date(parseInt(time) * 1000);

        return date.getHours();
    }

    getHourType(time) {
        let hour = this.getHour(time);
        return (hour >= 12) ? 'PM' : 'AM';
    }

    getMonth(time) {
        let date = new Date(parseInt(time) * 1000);
        //console.log(date);
        let month  = date.getMonth();
        let names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return names[month];
    }

    getMonthName(month) {
        let names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return names[month];
    }

    getDayName(time) {
        let days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
        let d = new Date(parseInt(time) * 1000);
        return days[d.getDay()];
    }

    formatText(text){
        switch(text) {
            case 'hours-ago':
                return lang.t('hours_ago');
                break;
            case 'days-ago':
                return lang.t('days_ago');
                break;
            case 'weeks-ago':
                return lang.t('weeks_ago');
                break;
            case 'years-ago':
                return lang.t('years_ago');
                break;
            case 'months-ago':
                return lang.t('months_ago');
                break;
            case 'minutes-ago':
                return lang.t('minutes_ago');
                break;
            case 'seconds-ago':
                return lang.t('seconds_ago');
                break;
            default:
                return lang.t(text);
                break;
        }
    }
}

const time = new Time();

export default time;