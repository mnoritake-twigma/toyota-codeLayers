import { useCallback, useEffect, useRef, useState } from "react";
import { searchDealers } from "../../api/searchDealers";
import { sortDealers, filterDealers } from "./sortDealers";
import type { DealerResult, SearchInput } from "../../types";
export function useDealerSearch() {
  const [state, setState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    dealers: DealerResult[];
    offline: boolean;
    message: string;
  }>({ status: "idle", dealers: [], offline: false, message: "" });
  const active = useRef<AbortController>();
  useEffect(() => () => active.current?.abort(), []);
  const reset = useCallback(() => {
    active.current?.abort();
    setState({ status: "idle", dealers: [], offline: false, message: "" });
  }, []);
  const search = useCallback(async (input: SearchInput) => {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setState({ status: "loading", dealers: [], offline: false, message: "" });
    try {
      const requestedDelay = Number(
        new URLSearchParams(location.search).get("delay") ?? 0,
      );
      const result = await searchDealers(
        input,
        controller.signal,
        Number.isFinite(requestedDelay) ? requestedDelay : 0,
      );
      if (controller.signal.aborted) return;
      setState({
        status: "success",
        dealers: sortDealers(filterDealers(result.dealers)),
        offline: result.offline,
        message: result.warning ?? "",
      });
    } catch (e) {
      if (!controller.signal.aborted)
        setState({
          status: "error",
          dealers: [],
          offline: false,
          message: e instanceof Error ? e.message : "検索に失敗しました。",
        });
    }
  }, []);
  return { ...state, search, reset };
}
