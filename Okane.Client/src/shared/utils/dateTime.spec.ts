// Internal
import * as dateTimeUtils from '@shared/utils/dateTime'

describe('dateToDateTimeLocalFormat', () => {
  test('formats the date in datetime-local format', () => {
    const date = new Date(2020, 10, 10, 10, 10, 10)

    const year = date.getFullYear()

    const month = date.getMonth() + 1
    const paddedMonth = month < 10 ? `0${month}` : month

    const day = date.getDate()
    const paddedDay = day < 10 ? `0${day}` : day

    const hours = date.getHours()
    const paddedHours = hours < 10 ? `0${hours}` : hours

    const minutes = date.getMinutes()
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes

    const expected = `${year}-${paddedMonth}-${paddedDay}T${paddedHours}:${paddedMinutes}`

    expect(dateTimeUtils.dateToDateTimeLocalFormat(date)).toBe(expected)
  })
})
