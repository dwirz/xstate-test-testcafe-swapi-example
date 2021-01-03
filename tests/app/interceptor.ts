import { FetchInterceptor } from "@smartive/testcafe-utils";

export const urls = {
  fetchPeople: /.+swapi\.dev\/api\/people\/$/,
  fetchMorePeople: /.+swapi\.dev\/api\/people\/.+page=\d+/,
  searchPeople: /.+swapi\.dev\/api\/people\/.+search=.*/,
};
export const fetchInterceptor = new FetchInterceptor(urls);
