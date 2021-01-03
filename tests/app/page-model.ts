import { Selector } from "testcafe";

export const Page = {
  SearchInput: Selector('[data-test-id="search-input"]'),
  ResetButton: Selector('[data-test-id="reset-button"]'),
  NoResults: Selector('[data-test-id="no-results"]'),
  Items: Selector('[data-test-id^="person-"]'),
  List: Selector('[data-test-id="people-list"]'),
  Loading: Selector('[data-test-id="loading-placeholder"]'),
  Searching: Selector('[data-test-id="search-placeholder"]'),
  MoreButton: Selector('[data-test-id="load-more-button"]'),
  GoToTopButton: Selector('[data-test-id="list-end-button"]'),
  Error: Selector('[data-test-id="error"]'),
  RestartButton: Selector('[data-test-id="restart-button"]'),
};
