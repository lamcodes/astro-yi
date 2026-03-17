import dayjs from 'dayjs'
import { shouldIncludeEntry } from './content-entry'

export const sortPostsByDate = (posts) =>
    posts
        .filter(({data}) => {
            return shouldIncludeEntry(data, import.meta.env.PROD)
        })
        .sort((a, b) => dayjs(b.data.date).unix() - dayjs(a.data.date).unix());
