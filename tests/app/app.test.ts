import { FakeTimers } from "@smartive/testcafe-utils";
import {
  createTestPlans,
  StatesTestFunctions,
} from "@smartive/xstate-test-toolbox";
import { TestEventsConfig } from "@xstate/test/lib/types";
import { Context, machine } from "../../src/statemachine";
import { fetchInterceptor } from "./interceptor";
import { getRequestMocks } from "./mocks";
import { Page } from "./page-model";

type TestContext = { t: TestController; plan: string; path: string };

const mockClock = new FakeTimers({ toFake: ["setTimeout"] });

const tests: StatesTestFunctions<Context, TestContext> = {
  Fetching: ({ t }) =>
    t.expect(Page.Items.count).eql(0).expect(Page.Loading.exists).ok(),
  Idle: {
    More: ({ t }) =>
      t.expect(Page.Items.count).eql(10).expect(Page.MoreButton.exists).ok(),
    End: ({ t }) =>
      t
        .expect(Page.Items.count)
        .gt(0)
        .expect(Page.MoreButton.exists)
        .notOk()
        .expect(Page.GoToTopButton.exists)
        .ok(),
    NoResults: ({ t }) =>
      t.expect(Page.Items.count).eql(0).expect(Page.NoResults.exists).ok(),
  },
  LoadingMore: ({ t }) =>
    t
      .expect(Page.Items.count)
      .gte(10)
      .expect(Page.MoreButton.hasAttribute("disabled"))
      .ok()
      .expect(Page.MoreButton.textContent)
      .eql("Loading..."),
  DebounceSearching: ({ t }) =>
    t.expect(Page.Items.count).eql(0).expect(Page.Searching.exists).ok(),
  Searching: ({ t }) =>
    t.expect(Page.Items.count).eql(0).expect(Page.Searching.exists).ok(),
  Error: ({ t }) =>
    t
      .expect(Page.SearchInput.exists)
      .notOk()
      .expect(Page.List.exists)
      .notOk()
      .expect(Page.Error.exists)
      .ok()
      .expect(Page.RestartButton.exists)
      .ok(),
};

const testEvents: TestEventsConfig<TestContext> = {
  DEBOUNCED_SEARCH: ({ t }) =>
    t
      .typeText(Page.SearchInput, "Luke")
      .expect(mockClock.execute({ t, method: "next", methodArgs: [] }))
      .ok(),
  RESET: ({ t }) => t.click(Page.ResetButton),
  LOAD_MORE: ({ t }) => t.click(Page.MoreButton),
  "done.invoke.fetchPeople": fetchInterceptor.resolve("fetchPeople"),
  "error.platform.fetchPeople": fetchInterceptor.resolve("fetchPeople"),
  "done.invoke.searchPeople": fetchInterceptor.resolve("searchPeople"),
  "error.platform.searchPeople": fetchInterceptor.resolve("searchPeople"),
  "done.invoke.fetchMorePeople": fetchInterceptor.resolve("fetchMorePeople"),
  "error.platform.fetchMorePeople": fetchInterceptor.resolve("fetchMorePeople"),
};

createTestPlans<typeof machine, TestContext, Context>({
  machine,
  tests,
  testEvents,
}).forEach(({ description: plan, paths }) => {
  fixture(plan).page("http://localhost:8080");

  paths.forEach(({ test: run, description: path }) => {
    test
      .clientScripts([
        fetchInterceptor.clientScript(),
        mockClock.clientScript(),
      ])
      .requestHooks(getRequestMocks(plan, path))(`via ${path} ⬏`, (t) =>
      run({ plan, path, t })
    );
  });
});
