import {subDays, subMonths, subWeeks} from "date-fns";
import {filterNew} from "../src/lib";

describe('filterNew()', () => {

  const todayDate = new Date()
  const threeMonthsAgo = subMonths(todayDate, 3).toISOString()
  const oneMonthAgo = subMonths(todayDate, 1).toISOString()
  const twoWeeksAgo = subWeeks(todayDate, 2).toISOString()
  const twoDaysAgo = subDays(todayDate, 2).toISOString()
  const oneDayAgo = subDays(todayDate, 1).toISOString()



  it('returns filtered projects that are new based on subDays', () => {
    const projects = [
      { created: twoWeeksAgo },
      { created: twoDaysAgo },
      { created: oneDayAgo },
    ]

    process.env.subDays = '3'
    const filteredProjects = filterNew(projects, todayDate)
    const expectedProjects = [
      { created: twoDaysAgo },
      { created: oneDayAgo },
    ]

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns no projects when none are new based on subDays', () => {
    const projects = [
      { created: twoWeeksAgo },
      { created: twoDaysAgo },
      { created: oneDayAgo },
    ]

    process.env.subDays = '1'
    const filteredProjects = filterNew(projects, todayDate)
    const expectedProjects = []

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns filtered projects that are new based on subMonths', () => {
    const projects = [
      { created: threeMonthsAgo },
      { created: oneMonthAgo },
      { created: twoWeeksAgo },
    ]

    process.env.subMonths = '2'
    const filteredProjects = filterNew(projects, todayDate)
    const expectedProjects = [
      { created: oneMonthAgo },
      { created: twoWeeksAgo },
    ]

    expect(filteredProjects).toEqual(expectedProjects)
  })
})
