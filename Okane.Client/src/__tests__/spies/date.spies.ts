export const spyOnDate = {
  now() {
    const mockedNow = 540720900
    const spy = vi.spyOn(Date, 'now').mockReturnValue(mockedNow)

    return { spy, now: mockedNow }
  },
}
