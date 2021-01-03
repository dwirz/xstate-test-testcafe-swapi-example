import PagedResults from "swapi-typescript/dist/models/PagedResults";
import People from "swapi-typescript/dist/models/People";
import {
  actions,
  AnyEventObject,
  assign,
  DoneInvokeEvent,
  Machine,
} from "xstate";
import { BASE_URL, get, https, search } from "./utils";

export type Context = {
  people: People[];
  next: string | null;
  query: string | null;
};

type SearchEvent = { type: "SEARCH"; data: string };
type PeopleDoneEvent = DoneInvokeEvent<PagedResults<People>>;
type Events =
  | { type: "RESET" | "LOAD_MORE" | "RETRY" | "DEBOUNCED_SEARCH" }
  | SearchEvent
  | PeopleDoneEvent;

const isPeopleDoneEvent = (event: AnyEventObject): event is PeopleDoneEvent =>
  /^done.+People$/.test(event.type);

const isSearchEvent = (event: AnyEventObject): event is SearchEvent =>
  event.type === "SEARCH";

export const machine = Machine<Context, Events>(
  {
    context: {
      people: [],
      next: null,
      query: null,
    },
    id: "PeopleMachine",
    initial: "Fetching",
    states: {
      Fetching: {
        invoke: {
          src: "fetchPeople",
          onDone: {
            target: "Idle.More",
            actions: "updatePeople",
          },
          onError: "Error",
        },
      },
      Idle: {
        on: {
          DEBOUNCED_SEARCH: "Searching",
          SEARCH: {
            actions: [
              "updateQuery",
              "cancelDebouncedSearch",
              "sendDebouncedSearch",
            ],
          },
          RESET: {
            target: "Fetching",
            actions: ["cancelDebouncedSearch", "resetQuery", "resetPeople"],
          },
        },
        initial: "More",
        states: {
          More: {
            on: {
              LOAD_MORE: {
                target: "#PeopleMachine.LoadingMore",
                actions: "cancelDebouncedSearch",
              },
            },
          },
          End: {},
          NoResults: {},
        },
      },
      LoadingMore: {
        invoke: {
          id: "fetchMorePeople",
          src: "fetchPeople",
          onDone: [
            {
              cond: "hasMore",
              target: "Idle.More",
              actions: "updatePeople",
            },
            {
              target: "Idle.End",
              actions: "updatePeople",
            },
          ],
          onError: "Error",
        },
      },
      Searching: {
        on: {
          RESET: {
            target: "Fetching",
            actions: ["resetQuery", "resetPeople"],
          },
        },
        onEntry: "resetPeople",
        invoke: {
          src: "searchPeople",
          onDone: [
            {
              cond: "hasMore",
              target: "Idle.More",
              actions: "updatePeople",
            },
            {
              cond: "hasPeople",
              target: "Idle.End",
              actions: "updatePeople",
            },
            {
              target: "Idle.NoResults",
            },
          ],
          onError: "Error",
        },
      },
      Error: {
        on: {
          RESTART: "Fetching",
        },
      },
    },
  },
  {
    actions: {
      resetQuery: assign((_) => ({ query: null })),
      updateQuery: assign((_, event) =>
        isSearchEvent(event) ? { query: event.data } : {}
      ),
      resetPeople: assign((_) => ({ people: [], next: null })),
      updatePeople: assign(({ people }, event) =>
        isPeopleDoneEvent(event)
          ? {
              people: [...people, ...event.data.results],
              next: event.data.next || null,
            }
          : {}
      ),
      cancelDebouncedSearch: actions.cancel("debounced-search"),
      sendDebouncedSearch: actions.send("DEBOUNCED_SEARCH", {
        delay: 300,
        id: "debounced-search",
      }),
    },
    services: {
      searchPeople: ({ query }) => search(query),
      fetchPeople: ({ next }) => get(https(next) || BASE_URL),
    },
    guards: {
      hasQuery: ({ query }) => query !== null,
      hasMore: (_, event) => isPeopleDoneEvent(event) && !!event.data.next,
      hasPeople: (_, event) => isPeopleDoneEvent(event) && event.data.count > 0,
    },
  }
);
