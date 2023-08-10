import {subDays} from "date-fns";
import {filterStale} from "../src/lib";

describe('filterStale()', () => {

  const todayDate = new Date(2023, 8, 8)

  const projectCloseDateA = {
    opportunityCloses: new Date(2023, 8, 4)
  }
  const projectCloseDateB = {
    opportunityCloses: new Date(2023, 8, 10)
  }
  const projectCloseDateC = {
    opportunityCloses: todayDate
  }

  const projectStartDateA = {
    startDate: new Date(2023, 8, 4)
  }
  const projectStartDateB = {
    startDate: new Date(2023, 8, 10)
  }
  const projectStartDateC = {
    startDate: todayDate
  }

  const projectLastModifiedA = {
    lastModified: subDays(todayDate, 91)
  }
  const projectLastModifiedB = {
    lastModified: subDays(todayDate, 5)
  }
  const projectLastModifiedC = {
    lastModified: subDays(todayDate, 90)
  }

  const projectEndDateA = {
    endDate: new Date(2023, 8, 4)
  }
  const projectEndDateB = {
    endDate: new Date(2023, 8, 10)
  }
  const projectEndDateC = {
    endDate: todayDate
  }


  it('returns identified stale open projects based on closeDate field', () => {
    const projects = [
      {...projectCloseDateA, status: "open"},
      {...projectCloseDateB, status: "open"},
      {...projectCloseDateC, status: "open"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = [
      { ...projectCloseDateA, status: "open", problems: ["The opportunity closes date has passed, but project is marked open."] }
    ]

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns no identified stale open projects based on closeDate field', () => {
    const projects = [
      {...projectCloseDateB, status: "open"},
      {...projectCloseDateC, status: "open"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = []

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns identified stale open projects based on startDate field', () => {
    const projects = [
      {...projectStartDateA, status: "open"},
      {...projectStartDateB, status: "open"},
      {...projectStartDateC, status: "open"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = [
      { ...projectStartDateA, status: "open", problems: ["The project start date has passed, but project is marked open."] }
    ]

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns no identified stale open projects based on startDate field', () => {
    const projects = [
      {...projectStartDateB, status: "open"},
      {...projectStartDateC, status: "open"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = []

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns identified stale open projects based on lastModified field', () => {
    const projects = [
      {...projectLastModifiedA, status: "open"},
      {...projectLastModifiedB, status: "open"},
      {...projectLastModifiedC, status: "open"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = [
      { ...projectLastModifiedA, status: "open", problems: ["It has been over 90 days since project's last modification."] }
    ]

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns no identified stale open projects based on lastModified field', () => {
    const projects = [
      {...projectLastModifiedB, status: "open"},
      {...projectLastModifiedC, status: "open"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = []

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns identified stale open projects based on endDate field', () => {
    const projects = [
      {...projectEndDateA, status: "open"},
      {...projectEndDateB, status: "open"},
      {...projectEndDateC, status: "open"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = [
      { ...projectEndDateA, status: "open", problems: ["The project end date has passed, but project is marked open."] }
    ]

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns no identified stale open projects based on endDate field', () => {
    const projects = [
      {...projectEndDateB, status: "open"},
      {...projectEndDateC, status: "open"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = []

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns identified stale ongoing projects based on lastModified field', () => {
    const projects = [
      {...projectLastModifiedA, status: "ongoing"},
      {...projectLastModifiedB, status: "ongoing"},
      {...projectLastModifiedC, status: "ongoing"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = [
      { ...projectLastModifiedA, status: "ongoing", problems: ["It has been over 90 days since project's last modification."] }
    ]

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns no identified stale ongoing projects based on lastModified field', () => {
    const projects = [
      {...projectLastModifiedB, status: "ongoing"},
      {...projectLastModifiedC, status: "ongoing"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = []

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns identified stale ongoing projects based on endDate field', () => {
    const projects = [
      {...projectEndDateA, status: "ongoing"},
      {...projectEndDateB, status: "ongoing"},
      {...projectEndDateC, status: "ongoing"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = [
      { ...projectEndDateA, status: "ongoing", problems: ["The project end date has passed, but project is marked open."] }
    ]

    expect(filteredProjects).toEqual(expectedProjects)
  })

  it('returns no identified stale ongoing projects based on endDate field', () => {
    const projects = [
      {...projectEndDateB, status: "ongoing"},
      {...projectEndDateC, status: "ongoing"}
    ]

    const filteredProjects = filterStale(projects, todayDate)
    const expectedProjects = []

    expect(filteredProjects).toEqual(expectedProjects)
  })

})