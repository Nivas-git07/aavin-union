import {
  BarChart3,
  Building2,
  FileBarChart2,
  LayoutDashboard,
  TriangleAlert,
  Users,
  Warehouse,
} from "lucide-react";

export const navItems = [
  { path: "overview", title: "Overview", icon: LayoutDashboard },
  { path: "analytics", title: "Analytics", icon: BarChart3 },
  { path: "bmcs", title: "BMCs", icon: Warehouse },
  { path: "societies", title: "Societies", icon: Building2 },
  { path: "farmers", title: "Farmers", icon: Users },
  { path: "no-supply", title: "No Supply", icon: TriangleAlert },
  { path: "reports", title: "Reports", icon: FileBarChart2 },
];

export const titles: Record<string, [string, string]> = {
  overview: [
    "Union overview",
    "A complete picture of milk collection across your union.",
  ],
  analytics: [
    "Collection analytics",
    "Understand trends, compare performance and see what needs attention.",
  ],
  bmcs: [
    "Bulk milk coolers",
    "Track collection and participation across your BMC network.",
  ],
  societies: [
    "Society directory",
    "Every society, its farmers and its contribution to the union.",
  ],
  farmers: [
    "Farmer directory",
    "Explore farmer profiles, milk collection and supply history.",
  ],
  "no-supply": [
    "Supply exceptions",
    "Find confirmed collection gaps and records that need follow-up.",
  ],
  reports: [
    "Reports & exports",
    "Turn your collection data into clear, shareable reports.",
  ],
};
