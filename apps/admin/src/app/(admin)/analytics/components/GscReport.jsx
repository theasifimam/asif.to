"use client";

import { useCallback, useEffect, useState } from "react";
import { analyticsApi } from "@/lib/api";
import ReportTable from "../ReportTable";
import { Pills, Loading, unwrap } from "./AnalyticsUI";

export default function GscReport({ range, refreshToken }) {
  const [type, setType] = useState("queries");
  const [page, setPage] = useState(1);
  const [report, setReport] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [sort, setSort] = useState("clicks");
  const [direction, setDirection] = useState("desc");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const response = await analyticsApi.search(type, {
      ...range,
      search: searchText,
      sort,
      direction,
      page,
      limit: 25,
    });
    if (response.success) setReport(unwrap(response));
    setLoading(false);
  }, [range, type, searchText, sort, direction, page, refreshToken]);

  useEffect(() => {
    load();
  }, [load]);

  const title = {
    queries: "Search queries",
    pages: "Search pages",
    countries: "Search countries",
    devices: "Search devices",
    appearance: "Search appearance",
  }[type];

  return (
    <div className="space-y-4">
      <Pills
        value={type}
        onChange={(value) => {
          setType(value);
          setPage(1);
          setSearchText("");
          setSort("clicks");
          setDirection("desc");
        }}
        items={[
          ["queries", "Queries"],
          ["pages", "Pages"],
          ["countries", "Countries"],
          ["devices", "Devices"],
          ["appearance", "Appearance"],
        ]}
      />

      {loading && !report ? (
        <Loading />
      ) : (
        <ReportTable
          title={title}
          type={type}
          report={report}
          search={searchText}
          onSearch={(value) => {
            setSearchText(value);
            setPage(1);
          }}
          sort={sort}
          direction={direction}
          onSort={(next) => {
            if (next === sort) {
              setDirection((current) => (current === "desc" ? "asc" : "desc"));
            } else {
              setSort(next);
              setDirection("desc");
            }
            setPage(1);
          }}
          page={page}
          onPage={setPage}
          onOpen={(url) => window.open(url, "_blank")}
        />
      )}
    </div>
  );
}
