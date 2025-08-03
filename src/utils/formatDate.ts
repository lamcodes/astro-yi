import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { config } from '../consts';
import { t } from '../i18n/utils';

dayjs.locale(config.lang);
dayjs.extend(utc);
dayjs.extend(timezone); 
dayjs.extend(advancedFormat);

export function formatDate(date, dateType = 'post.dateFormat') {
    if (date) {
        const dateFormat = t(dateType) || "YYYY-MM-DD HH:mm:ss";
        // 对于 Date 对象
        if (date instanceof Date) {
            return formatDateUtc(date);
        }
        // 对于字符串日期，直接解析
        return dayjs(date).format(dateFormat);
    }
    return '';
}

export function formatDateUtc(date, dateType = 'post.dateFormat') {
    if (date) {
        const dateFormat = t(dateType) || "YYYY-MM-DD HH:mm:ss";
        // 3. 强制使用 Asia/Shanghai 时区进行格式化
        return dayjs(date).tz('Asia/Shanghai').format(dateFormat);
    }
    return '';
}