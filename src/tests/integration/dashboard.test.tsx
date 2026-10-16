// @vitest-environment jsdom
import App from "@/app/App";
import { demoRepository } from "@/services/demoRepository";
import { indiaDate } from "@/utils/date";
import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("recharts", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children: _children }: { children: ReactNode }) => (
      <div data-testid="chart-container" />
    ),
  };
});
function start(path = "/") {
  window.history.replaceState({}, "", path);
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
}
async function ready() {
  await waitFor(
    () =>
      expect(
        screen.queryByText("Preparing your collection report"),
      ).not.toBeInTheDocument(),
    { timeout: 10000 },
  );
}
async function chooseOption(label: string, option: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole("combobox", { name: label }));
  await user.click(screen.getByRole("option", { name: option }));
}
beforeEach(() => {
  window.scrollTo = vi.fn();
  window.print = vi.fn();
  HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
  HTMLElement.prototype.scrollIntoView = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute("open", "");
  });
  URL.createObjectURL = vi.fn(() => "blob:demo");
  URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("management dashboard interactions", () => {
  it("searches owner Aadhaar by keyboard and displays every cow and its medicine history", async () => {
    start("/cow-details");
    const user = userEvent.setup();
    expect(
      screen.getByRole("heading", { name: "Cow Details", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("0000 0000 0001")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Find an owner's cows" }),
    ).toBeInTheDocument();
    await user.type(
      screen.getByLabelText("Owner Aadhaar number"),
      "0000 0000-0001{Enter}",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "2 registered cows found for A. Murugan",
    );
    expect(
      screen.getByRole("link", { name: "A. Murugan" }),
    ).toBeInTheDocument();
    expect(screen.getByText("FMR-0001")).toBeInTheDocument();
    expect(screen.getByText("DEMO-0001")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Arittapatti Society" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Melur BMC")).toBeInTheDocument();
    expect(screen.getByText("Arittapatti, Madurai")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "COW-0001-01" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "COW-0001-02" }),
    ).toBeInTheDocument();
    expect(screen.getByText("DEMO-TAG-0001-01")).toBeInTheDocument();
    expect(screen.getByText("Jersey cross")).toBeInTheDocument();
    expect(screen.getByText("15 January 2020")).toBeInTheDocument();
    expect(screen.getByText("Lactating")).toBeInTheDocument();
    expect(screen.getByText("No medicine records")).toBeInTheDocument();
    const rows = within(
      screen.getByRole("table", { name: "Medicine history for COW-0001-01" }),
    ).getAllByRole("row");
    expect(rows).toHaveLength(3);
    expect(rows[1]).toHaveTextContent("12 September 2026");
    expect(rows[1]).toHaveTextContent("Demo veterinary supplement");
    expect(rows[1]).toHaveTextContent("Post-examination care");
    expect(rows[1]).toHaveTextContent("1 demo measure");
    expect(rows[1]).toHaveTextContent("3 days");
    expect(rows[1]).toHaveTextContent("Demo veterinarian B");
    expect(rows[1]).toHaveTextContent(
      "Fictional record; routine review recorded.",
    );
    expect(rows[2]).toHaveTextContent("10 June 2026");
    expect(window.location.search).toBe("");
  });
  it("validates Aadhaar, handles no match and clears stale results when changing owners", () => {
    start("/cow-details");
    const input = screen.getByLabelText("Owner Aadhaar number");
    const search = screen.getByRole("button", { name: "Search" });
    for (const value of [
      "",
      "123",
      "0000000000012",
      "00000000000a",
      "0000.0000.0001",
    ]) {
      fireEvent.change(input, { target: { value } });
      fireEvent.click(search);
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Enter a 12-digit Aadhaar number",
      );
      expect(input).toHaveAttribute("aria-invalid", "true");
    }
    fireEvent.change(input, { target: { value: "999999999999" } });
    fireEvent.click(search);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("No owner found");
    fireEvent.change(input, { target: { value: "000000000001" } });
    fireEvent.click(search);
    expect(
      screen.getByRole("link", { name: "A. Murugan" }),
    ).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "000000000002" } });
    expect(
      screen.queryByRole("link", { name: "A. Murugan" }),
    ).not.toBeInTheDocument();
    fireEvent.click(search);
    expect(screen.getByRole("status")).toHaveTextContent(
      "3 registered cows found for A. Lakshmi",
    );
    expect(
      screen.getByRole("heading", { name: "COW-0002-03" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    expect(
      screen.queryByRole("heading", { name: "Owner details" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Find an owner's cows" }),
    ).toBeInTheDocument();
  });
  it("loads cow lookup independently of invalid collection filters and report calculations", () => {
    const summarize = vi.spyOn(demoRepository, "summarize");
    const query =
      "?period=Custom+Range&start=2026-10-17&end=2026-10-01&bmc=BMC-006&society=SOC-030";
    start(`/cow-details${query}`);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Reporting period")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Preparing your collection report"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Print" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Export data" }),
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Owner Aadhaar number"), {
      target: { value: "000000000001" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(
      screen.getByRole("link", { name: "A. Murugan" }),
    ).toBeInTheDocument();
    expect(summarize).not.toHaveBeenCalled();
    expect(window.location.search).toBe(query);
  });
  it.each([
    ["A. Murugan", "/farmers/FMR-0001"],
    ["Arittapatti Society", "/societies/SOC-001"],
  ])(
    "opens the linked %s record with its society scope",
    async (name, path) => {
      start(
        "/cow-details?period=Yesterday&shift=Morning&bmc=BMC-006&society=SOC-030",
      );
      fireEvent.change(screen.getByLabelText("Owner Aadhaar number"), {
        target: { value: "000000000001" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Search" }));
      fireEvent.click(screen.getByRole("link", { name }));
      await ready();
      expect(window.location.pathname).toBe(path);
      expect(
        screen.getByRole("heading", { level: 1, name }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Filter by BMC")).toHaveValue("BMC-001");
      expect(screen.getByLabelText("Filter by society")).toHaveValue("SOC-001");
      expect(new URLSearchParams(window.location.search).get("period")).toBe(
        "Yesterday",
      );
      expect(new URLSearchParams(window.location.search).get("shift")).toBe(
        "Morning",
      );
    },
  );
  it("opens Cow Details from navigation and retains collection filters on return", async () => {
    start(
      "/farmers?period=Yesterday&shift=Morning&bmc=BMC-002&society=SOC-007",
    );
    await ready();
    const user = userEvent.setup();
    const nav = within(
      screen.getByRole("navigation", { name: "Main navigation" }),
    );
    nav.getByRole("link", { name: "Cow Details" }).focus();
    await user.keyboard("{Enter}");
    expect(window.location.pathname).toBe("/cow-details");
    expect(nav.getByRole("link", { name: "Cow Details" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.queryByLabelText("Reporting period")).not.toBeInTheDocument();
    await user.click(nav.getByRole("link", { name: "Farmers" }));
    await ready();
    expect(screen.getByLabelText("Reporting period")).toHaveValue("Yesterday");
    expect(screen.getByLabelText("Filter by BMC")).toHaveValue("BMC-002");
    expect(screen.getByLabelText("Filter by society")).toHaveValue("SOC-007");
    expect(screen.getByRole("button", { name: "Morning" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
  it("supports dropdown keyboard selection, selected states and Escape focus return", async () => {
    start("/?period=Yesterday");
    await ready();
    const user = userEvent.setup();
    const trigger = screen.getByRole("combobox", { name: "Reporting period" });
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Yesterday" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await user.keyboard("{End}{Enter}");
    await ready();
    expect(trigger).toHaveTextContent("Custom Range");
    expect(screen.getByLabelText("Start date")).toBeInTheDocument();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    await user.click(trigger);
    await user.keyboard("{Home}{Escape}");
    expect(trigger).toHaveTextContent("Custom Range");
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
  it("clears the society when choosing a different BMC, and restores all-BMC scope", async () => {
    start("/farmers?period=Yesterday&bmc=BMC-002&society=SOC-007");
    await ready();
    await chooseOption("Filter by BMC", "Melur BMC");
    await ready();
    expect(
      screen.getByRole("combobox", { name: "Filter by society" }),
    ).toHaveTextContent("All societies");
    expect(new URLSearchParams(window.location.search).has("society")).toBe(
      false,
    );
    await chooseOption("Filter by BMC", "All BMCs");
    await ready();
    expect(new URLSearchParams(window.location.search).has("bmc")).toBe(false);
    expect(
      screen.getByRole("combobox", { name: "Filter by BMC" }),
    ).toHaveTextContent("All BMCs");
  });
  it("opens the analytics page using the keyboard and renders its report", async () => {
    start("/?period=Yesterday");
    await ready();
    const user = userEvent.setup();
    const link = within(
      screen.getByRole("navigation", { name: "Main navigation" }),
    ).getByRole("link", { name: "Analytics" });
    link.focus();
    await user.keyboard("{Enter}");
    await ready();
    expect(window.location.pathname).toBe("/analytics");
    expect(screen.getByText("Daily average")).toBeInTheDocument();
    expect(screen.getByText("Missed supply shifts")).toBeInTheDocument();
  });
  it("opens a society and follows its farmer records through global search", async () => {
    start("/societies/SOC-007?period=Yesterday");
    await ready();
    expect(
      screen.getByRole("heading", { level: 1, name: "Karumathur Society" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Daily collection history" }),
    ).toBeInTheDocument();
    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Search all BMCs, societies and farmers",
      }),
      { target: { value: "FMR-0123" } },
    );
    fireEvent.click(screen.getByRole("link", { name: /G\. Selvam.*FMR-0123/ }));
    await ready();
    expect(window.location.pathname).toBe("/farmers/FMR-0123");
    expect(screen.getByLabelText("Filter by society")).toHaveValue("SOC-007");
    expect(
      screen.getByRole("heading", { name: "Daily milk ledger" }),
    ).toBeInTheDocument();
  });
  it("provides eight main pages and shows the default collection overview", async () => {
    start();
    await ready();
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    expect(within(nav).getAllByRole("link")).toHaveLength(8);
    for (const name of [
      "Overview",
      "Analytics",
      "BMCs",
      "Societies",
      "Farmers",
      "Cow Details",
      "No Supply",
      "Reports",
    ])
      expect(within(nav).getByRole("link", { name })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Union overview", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Registered farmers")).toBeInTheDocument();
    expect(screen.getByText("Registered cows")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Show trend data table" }),
    );
    expect(
      screen.getByRole("table", { name: "Milk collection in litres" }),
    ).toBeInTheDocument();
  });
  it("retains period, shift and BMC filters when moving between main pages", async () => {
    start();
    await ready();
    await chooseOption("Reporting period", "Last 7 Days");
    fireEvent.click(screen.getByRole("button", { name: "Morning" }));
    await chooseOption("Filter by BMC", "Usilampatti BMC");
    await ready();
    fireEvent.click(
      within(
        screen.getByRole("navigation", { name: "Main navigation" }),
      ).getByRole("link", { name: "Societies" }),
    );
    await ready();
    expect(window.location.pathname).toBe("/societies");
    expect(screen.getByLabelText("Reporting period")).toHaveValue(
      "Last 7 Days",
    );
    expect(screen.getByLabelText("Filter by BMC")).toHaveValue("BMC-002");
    expect(screen.getByRole("button", { name: "Morning" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const user = userEvent.setup();
    await user.click(
      screen.getByRole("combobox", { name: "Filter by society" }),
    );
    expect(screen.getAllByRole("option")).toHaveLength(6);
    await user.keyboard("{Escape}");
  });
  it("supports complete directory search, pagination, sorting and export", async () => {
    start("/farmers?period=Yesterday");
    await ready();
    const table = within(screen.getByRole("main")).getByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(11);
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText("Page 2 of 60")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Export CSV" }));
    expect(URL.createObjectURL).toHaveBeenCalledOnce();
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
    const csv = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsText(blob);
    });
    expect(csv.split("\r\n")).toHaveLength(601);
    expect(csv).toContain("FMR-0600");
    fireEvent.change(
      screen.getByRole("textbox", { name: "Search Farmer directory" }),
      { target: { value: "FMR-0600" } },
    );
    expect(within(table).getAllByRole("row")).toHaveLength(2);
    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear table search" }));
    fireEvent.click(screen.getByRole("button", { name: "FARMER" }));
    expect(within(table).getAllByRole("row")).toHaveLength(11);
  });
  it("drills from a BMC into linked farmers and keeps scope on follow-up navigation", async () => {
    start("/bmcs/BMC-002?period=Yesterday");
    await ready();
    expect(
      screen.getByRole("heading", { level: 1, name: "Usilampatti BMC" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Filter by BMC")).toHaveValue("BMC-002");
    expect(screen.getByLabelText("Filter by BMC")).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Linked farmers" }));
    expect(
      screen.getByRole("heading", { name: "Farmer collection" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Daily collection history" }),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("link", { name: "View affected farmers" }),
    );
    await ready();
    expect(window.location.pathname).toBe("/no-supply");
    expect(new URLSearchParams(window.location.search).get("bmc")).toBe(
      "BMC-002",
    );
    expect(
      screen.getByRole("heading", { name: "Supply follow-up list" }),
    ).toBeInTheDocument();
  });
  it("changes no-supply tabs, exports all matching parent rows, and drills into farmers", async () => {
    start("/no-supply?period=Yesterday");
    await ready();
    fireEvent.click(screen.getByRole("button", { name: "BMCs" }));
    expect(
      screen.getByText("6 BMCs · all closed-shift gaps"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Export data" }));
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
    const csv = await new Promise<string>((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.readAsText(blob);
    });
    expect(csv.split("\r\n")).toHaveLength(7);
    fireEvent.click(screen.getAllByRole("link", { name: "Open Melur BMC" })[0]);
    await ready();
    expect(new URLSearchParams(window.location.search).get("tab")).toBe(
      "farmers",
    );
    expect(screen.getByLabelText("Filter by BMC")).toHaveValue("BMC-001");
  });
  it("shows selected-date farmer ledger and full historical totals", async () => {
    start("/farmers/FMR-0002?period=Yesterday");
    await ready();
    expect(
      screen.getByRole("heading", { name: "Daily milk ledger" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Total recorded milk")).toBeInTheDocument();
    expect(screen.getByText("DEMO-0002")).toBeInTheDocument();
    await chooseOption("Reporting period", "Selected Date");
    await ready();
    expect(screen.getByLabelText("Start date")).toHaveValue(indiaDate());
    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2025-05-01" },
    });
    await ready();
    expect(new URLSearchParams(window.location.search).get("end")).toBe(
      "2025-05-01",
    );
  });
  it("shows all five exportable reports and prints complete records", async () => {
    const { container } = start("/reports?period=Yesterday");
    await ready();
    expect(screen.getAllByRole("button", { name: "Export CSV" })).toHaveLength(
      5,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Print Farmer collection" }),
    );
    await waitFor(() => expect(window.print).toHaveBeenCalledOnce());
    expect(container.querySelectorAll(".print-report tbody tr")).toHaveLength(
      600,
    );
  });
  it("handles invalid ranges, unknown records and empty searches", async () => {
    start("/farmers?period=Custom+Range&start=2026-10-17&end=2026-10-01");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "start date must be on or before",
    );
    cleanup();
    start("/farmers/DOES-NOT-EXIST");
    expect(
      screen.getByRole("heading", { name: "We couldn’t find that record" }),
    ).toBeInTheDocument();
    cleanup();
    start("/farmers?period=Yesterday");
    await ready();
    fireEvent.change(
      screen.getByRole("textbox", { name: "Search Farmer directory" }),
      { target: { value: "nonexistent-record" } },
    );
    expect(
      screen.getByRole("heading", { name: "No records to show" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export CSV" })).toBeDisabled();
  });
  it("opens and closes the workspace guide and collapses navigation", async () => {
    start();
    await ready();
    fireEvent.click(
      screen.getByRole("button", { name: "Open workspace guide" }),
    );
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    expect(screen.getByText("Your union, in one place.")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Close workspace guide" }),
    );
    expect(
      screen.queryByText("Your union, in one place."),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(
      screen.getByRole("button", { name: "Expand sidebar" }),
    ).toBeInTheDocument();
  });
});
