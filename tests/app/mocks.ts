import { mockHeaders } from "@smartive/testcafe-utils";
import { RequestMock } from "testcafe";
import { urls } from "./interceptor";

const requestMock = (
  pattern: RegExp,
  statusCode: number,
  result?: object | string
) =>
  RequestMock().onRequestTo(pattern).respond(result, statusCode, mockHeaders);

const errorRequestMock = (pattern: RegExp) => requestMock(pattern, 400, {});

const noNextRequestMock = (pattern: RegExp) =>
  requestMock(pattern, 200, {
    count: 82,
    next: null,
    previous: null,
    results: [
      {
        name: "Anakin Skywalker",
        height: "188",
        mass: "84",
        hair_color: "blond",
        skin_color: "fair",
        eye_color: "blue",
        birth_year: "41.9BBY",
        gender: "male",
        homeworld: "http://swapi.dev/api/planets/1/",
        films: [
          "http://swapi.dev/api/films/4/",
          "http://swapi.dev/api/films/5/",
          "http://swapi.dev/api/films/6/",
        ],
        species: [],
        vehicles: [
          "http://swapi.dev/api/vehicles/44/",
          "http://swapi.dev/api/vehicles/46/",
        ],
        starships: [
          "http://swapi.dev/api/starships/39/",
          "http://swapi.dev/api/starships/59/",
          "http://swapi.dev/api/starships/65/",
        ],
        created: "2014-12-10T16:20:44.310000Z",
        edited: "2014-12-20T21:17:50.327000Z",
        url: "http://swapi.dev/api/people/11/",
      },
      {
        name: "Wilhuff Tarkin",
        height: "180",
        mass: "unknown",
        hair_color: "auburn, grey",
        skin_color: "fair",
        eye_color: "blue",
        birth_year: "64BBY",
        gender: "male",
        homeworld: "http://swapi.dev/api/planets/21/",
        films: [
          "http://swapi.dev/api/films/1/",
          "http://swapi.dev/api/films/6/",
        ],
        species: [],
        vehicles: [],
        starships: [],
        created: "2014-12-10T16:26:56.138000Z",
        edited: "2014-12-20T21:17:50.330000Z",
        url: "http://swapi.dev/api/people/12/",
      },
    ],
  });

export const noResultsRequestMock = (pattern: RegExp) =>
  requestMock(pattern, 200, {
    count: 0,
    next: null,
    previous: null,
    results: [],
  });

export const getRequestMocks = (plan: string, path: string): object[] => {
  const mocks = [];

  if (
    ["Searching", "End", "NoResults", "Error"].some((p) =>
      plan.includes(p)
    ) &&
    path.includes("done.invoke.fetchMorePeople")
  ) {
    mocks.push(noNextRequestMock(urls.fetchMorePeople));
  }

  if (plan.includes("NoResults")) {
    mocks.push(noResultsRequestMock(urls.searchPeople));
  }

  if (plan.includes("End") && path.includes("done.invoke.searchPeople")) {
    mocks.push(noNextRequestMock(urls.searchPeople));
  }

  if (path.includes("error.platform.fetchPeople")) {
    mocks.push(errorRequestMock(urls.fetchPeople));
  }

  if (path.includes("error.platform.fetchMorePeople")) {
    mocks.push(errorRequestMock(urls.fetchMorePeople));
  }

  if (path.includes("error.platform.searchPeople")) {
    mocks.push(errorRequestMock(urls.searchPeople));
  }

  return mocks;
};
