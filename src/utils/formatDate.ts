import dayjs from "dayjs";
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { config } from '../consts';
import { t } from '../i18n/utils';

dayjs.locale(config.lang);
dayjs.extend(advancedFormat);

export function formatDate(date, dateType = 'post.dateFormat') {
    if (date) {
        const dateFormat = t(dateType) || "YYYY-MM-DD HH:mm:ss";
        // 对于 Date 对象（来自 fs.statSync），直接使用 toISOString 方法去掉时区信息
        if (date instanceof Date) {
            return dayjs(date.toISOString().split('Z')[0]).format(dateFormat);
        }
        // 对于字符串日期，直接解析
        return dayjs(date).format(dateFormat);
    }
    return '';
}
