import {subDays, subMonths, subWeeks} from "date-fns";
import {filterNew} from "../src/lib";

describe('filterNew()', () => {

  const todayDate = new Date()
  const date1 = subMonths(todayDate, 3).toISOString()
  const date2 = subMonths(todayDate, 1).toISOString()
  const date3 = subWeeks(todayDate, 2).toISOString()
  const date4 = subDays(todayDate, 2).toISOString()
  const date5 = subDays(todayDate, 1).toISOString()



  it('returns filtered projects that are new based on subDays', () => {
    const projects = [
      { created: date3 },
      { created: date4 },
      { created: date5 },
    ]

    process.env.subDays = '3'
    const filteredProjects = filterNew(projects, todayDate)
    const expectedProjects = [
      { created: date4 },
      { created: date5 },
    ]

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns no projects when none are new based on subDays', () => {
    const projects = [
      { created: date3 },
      { created: date4 },
      { created: date5 },
    ]

    process.env.subDays = '1'
    const filteredProjects = filterNew(projects, todayDate)
    const expectedProjects = []

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns filtered projects that are new based on subMonths', () => {
    const projects = [
      { created: date1 },
      { created: date2 },
      { created: date3 },
    ]

    process.env.subMonths = '2'
    const filteredProjects = filterNew(projects, todayDate)
    const expectedProjects = [
      { created: date2 },
      { created: date3 },
    ]

    expect(filteredProjects).toEqual(expectedProjects)
  })
})
