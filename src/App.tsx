import { useMachine } from "@xstate/react";
import React from "react";
import { machine } from "./statemachine";
import "./styles.css";

const BASE_10_FFFFFF = 16777215;
const color = (seed: number) =>
  Math.floor(
    Math.abs(Math.sin(seed) * BASE_10_FFFFFF) % BASE_10_FFFFFF
  ).toString(16);

const devTools = process.env.NODE_ENV !== "production";

export default function App() {
  const [{ matches, context }, send] = useMachine(machine, { devTools });

  if (matches("Error")) {
    return (
      <div data-test-id="error">
        <p>Error occured!</p>
        <button data-test-id="restart-button" onClick={() => send("RESTART")}>
          Restart
        </button>
      </div>
    );
  }

  return (
    <div>
      <form>
        <input
          type="text"
          data-test-id="search-input"
          value={context.query || ""}
          onChange={({ target: { value } }) =>
            send({ type: "SEARCH", data: value })
          }
        />
        <button
          data-test-id="reset-button"
          type="reset"
          onClick={() => send("RESET")}
        >
          X
        </button>
      </form>

      {matches("Idle.NoResults") && (
        <p data-test-id="no-results">No People Found.</p>
      )}

      <ul data-test-id="people-list">
        {context.people.map(({ url, name, created }) => (
          <li
            data-test-id={`person-${url}`}
            key={url}
            style={{ background: `#${color(new Date(created).getTime())}` }}
          >
            {name}
          </li>
        ))}
        {matches("Fetching") && (
          <li data-test-id="loading-placeholder">Loading...</li>
        )}
        {matches("Searching") && (
          <li data-test-id="search-placeholder">{`Searching "${
            context.query || ""
          }"...`}</li>
        )}
        {matches("Idle.End") && (
          <li>
            <button
              data-test-id="list-end-button"
              onClick={() => window.scrollTo(0, 0)}
            >
              ^ Go to Top
            </button>
          </li>
        )}
        {(matches("LoadingMore") || matches("Idle.More")) && (
          <li>
            <button
              data-test-id="load-more-button"
              type="button"
              disabled={matches("LoadingMore")}
              onClick={() => send("LOAD_MORE")}
            >
              {matches("LoadingMore") ? "Loading..." : "Load More"}
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
