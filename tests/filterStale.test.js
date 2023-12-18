import {subDays} from "date-fns";
import {filterStale} from "../src/lib";

describe('filterStale()', () => {

  const todayDate = new Date(2023, 8, 8)

  const dateBeforeTodayDate = new Date(2023, 8, 4)
  const datePastTodayDate = new Date(2023, 8, 10)

  const ninetyOneDaysBeforeTodayDate = subDays(todayDate, 91)
  const fiveDaysBeforeTodayDate = subDays(todayDate, 5)
  const ninetyDaysBeforeTodayDate = subDays(todayDate, 90)


  it('returns identified stale open projects based on closeDate field', () => {
    const projects = [
      {opportunityCloses: dateBeforeTodayDate, status: "open"},
      {opportunityCloses: datePastTodayDate, status: "open"},
      {opportunityCloses: todayDate, status: "open"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = [
      { opportunityCloses: dateBeforeTodayDate, status: "open", problems: ["The opportunity closes date has passed, but project is marked open."] }
    ]

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns no identified stale open projects based on closeDate field', () => {
    const projects = [
      {opportunityCloses: datePastTodayDate, status: "open"},
      {opportunityCloses: todayDate, status: "open"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = []

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns identified stale open projects based on startDate field', () => {
    const projects = [
      {startDate: dateBeforeTodayDate, status: "open"},
      {startDate: datePastTodayDate, status: "open"},
      {startDate: todayDate, status: "open"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = [
      { startDate: dateBeforeTodayDate, status: "open", problems: ["The project start date has passed, but project is marked open."] }
    ]

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns no identified stale open projects based on startDate field', () => {
    const projects = [
      {startDate: datePastTodayDate, status: "open"},
      {startDate: todayDate, status: "open"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = []

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns identified stale open projects based on lastModified field', () => {
    const projects = [
      {lastModified: ninetyOneDaysBeforeTodayDate, status: "open"},
      {lastModified: fiveDaysBeforeTodayDate, status: "open"},
      {lastModified: ninetyDaysBeforeTodayDate, status: "open"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = [
      { lastModified: ninetyOneDaysBeforeTodayDate, status: "open", problems: ["It has been over 90 days since project's last modification."] }
    ]

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns no identified stale open projects based on lastModified field', () => {
    const projects = [
      {lastModified: fiveDaysBeforeTodayDate, status: "open"},
      {lastModified: ninetyDaysBeforeTodayDate, status: "open"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = []

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns identified stale open projects based on endDate field', () => {
    const projects = [
      {endDate: dateBeforeTodayDate, status: "open"},
      {endDate: datePastTodayDate, status: "open"},
      {endDate: todayDate, status: "open"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = [
      { endDate: dateBeforeTodayDate, status: "open", problems: ["The project end date has passed, but project is marked open."] }
    ]

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns no identified stale open projects based on endDate field', () => {
    const projects = [
      {endDate: datePastTodayDate, status: "open"},
      {endDate: todayDate, status: "open"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = []

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns identified stale ongoing projects based on lastModified field', () => {
    const projects = [
      {lastModified: ninetyOneDaysBeforeTodayDate, status: "ongoing"},
      {lastModified: fiveDaysBeforeTodayDate, status: "ongoing"},
      {lastModified: ninetyDaysBeforeTodayDate, status: "ongoing"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = [
      { lastModified: ninetyOneDaysBeforeTodayDate, status: "ongoing", problems: ["It has been over 90 days since project's last modification."] }
    ]

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns no identified stale ongoing projects based on lastModified field', () => {
    const projects = [
      {lastModified: fiveDaysBeforeTodayDate, status: "ongoing"},
      {lastModified: ninetyDaysBeforeTodayDate, status: "ongoing"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = []

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns identified stale ongoing projects based on endDate field', () => {
    const projects = [
      {endDate: dateBeforeTodayDate, status: "ongoing"},
      {endDate: datePastTodayDate, status: "ongoing"},
      {endDate: todayDate, status: "ongoing"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = [
      { endDate: dateBeforeTodayDate, status: "ongoing", problems: ["The project end date has passed, but project is marked open."] }
    ]

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns no identified stale ongoing projects based on endDate field', () => {
    const projects = [
      {endDate: datePastTodayDate, status: "ongoing"},
      {endDate: todayDate, status: "ongoing"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = []

    expect(filteredProjects).toEqual(expectedProjects)
  })

})