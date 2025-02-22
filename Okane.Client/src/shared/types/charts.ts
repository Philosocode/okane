// This is a subset of the available fields. For more details, see:
// https://echarts.apache.org/en/option.html#tooltip.formatter:~:text=2.%20Callback%20function
export type PieChartFormatterParams = {
  data: {
    value: number
  }
  name: string
  percent: number
}
