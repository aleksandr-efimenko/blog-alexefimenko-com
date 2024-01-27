export function sortByDateDesc(left: { date: string | number | Date }, right: { date: string | number | Date }) {
  const date1 = new Date(left.date)
  const date2 = new Date(right.date)
  if (date1 > date2) {
    return -1
  }
  if (date1 < date2) {
    return 1
  }
  return 0
}
