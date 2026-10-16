// @vitest-environment jsdom
import App from "@/app/App";
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
  it("provides seven main pages and shows the default collection overview", async () => {
    start();
    await ready();
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    expect(within(nav).getAllByRole("link")).toHaveLength(7);
    for (const name of [
      "Overview",
      "Analytics",
      "BMCs",
      "Societies",
      "Farmers",
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
