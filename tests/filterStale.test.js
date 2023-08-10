import {subDays} from "date-fns";
import {filterStale} from "../src/lib";

describe('filterStale()', () => {

  const todayDate = new Date(2023, 8, 8)

  const dateA = new Date(2023, 8, 4)
  const dateB = new Date(2023, 8, 10)

  const dateC = subDays(todayDate, 91)
  const dateD = subDays(todayDate, 5)
  const dateE = subDays(todayDate, 90)


  it('returns identified stale open projects based on closeDate field', () => {
    const projects = [
      {opportunityCloses: dateA, status: "open"},
      {opportunityCloses: dateB, status: "open"},
      {opportunityCloses: todayDate, status: "open"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = [
      { opportunityCloses: dateA, status: "open", problems: ["The opportunity closes date has passed, but project is marked open."] }
    ]

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns no identified stale open projects based on closeDate field', () => {
    const projects = [
      {opportunityCloses: dateB, status: "open"},
      {opportunityCloses: todayDate, status: "open"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = []

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns identified stale open projects based on startDate field', () => {
    const projects = [
      {startDate: dateA, status: "open"},
      {startDate: dateB, status: "open"},
      {startDate: todayDate, status: "open"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = [
      { startDate: dateA, status: "open", problems: ["The project start date has passed, but project is marked open."] }
    ]

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns no identified stale open projects based on startDate field', () => {
    const projects = [
      {startDate: dateB, status: "open"},
      {startDate: todayDate, status: "open"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = []

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns identified stale open projects based on lastModified field', () => {
    const projects = [
      {lastModified: dateC, status: "open"},
      {lastModified: dateD, status: "open"},
      {lastModified: dateE, status: "open"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = [
      { lastModified: dateC, status: "open", problems: ["It has been over 90 days since project's last modification."] }
    ]

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns no identified stale open projects based on lastModified field', () => {
    const projects = [
      {lastModified: dateD, status: "open"},
      {lastModified: dateE, status: "open"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = []

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns identified stale open projects based on endDate field', () => {
    const projects = [
      {endDate: dateA, status: "open"},
      {endDate: dateB, status: "open"},
      {endDate: todayDate, status: "open"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = [
      { endDate: dateA, status: "open", problems: ["The project end date has passed, but project is marked open."] }
    ]

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns no identified stale open projects based on endDate field', () => {
    const projects = [
      {endDate: dateB, status: "open"},
      {endDate: todayDate, status: "open"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = []

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns identified stale ongoing projects based on lastModified field', () => {
    const projects = [
      {lastModified: dateC, status: "ongoing"},
      {lastModified: dateD, status: "ongoing"},
      {lastModified: dateE, status: "ongoing"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = [
      { lastModified: dateC, status: "ongoing", problems: ["It has been over 90 days since project's last modification."] }
    ]

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns no identified stale ongoing projects based on lastModified field', () => {
    const projects = [
      {lastModified: dateD, status: "ongoing"},
      {lastModified: dateE, status: "ongoing"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = []

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns identified stale ongoing projects based on endDate field', () => {
    const projects = [
      {endDate: dateA, status: "ongoing"},
      {endDate: dateB, status: "ongoing"},
      {endDate: todayDate, status: "ongoing"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = [
      { endDate: dateA, status: "ongoing", problems: ["The project end date has passed, but project is marked open."] }
    ]

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns no identified stale ongoing projects based on endDate field', () => {
    const projects = [
      {endDate: dateB, status: "ongoing"},
      {endDate: todayDate, status: "ongoing"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = []

    expect(filteredProjects).toEqual(expectedProjects)
  })

})