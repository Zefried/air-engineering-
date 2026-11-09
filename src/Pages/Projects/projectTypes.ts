export interface ProjectWorker {
  id: number | string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

export type ProjectStatus = "In Progress" | "Planning" | "On Hold" | "Completed";

export interface ProjectSiteItem {
  id: string;
  name: string;
  client: string;
  siteLocation: string;
  managerId?: number | string;
  managerName: string;
  status: ProjectStatus;
  startDate: string;
  dueDate: string;
  workers: ProjectWorker[];
  description?: string;
}

export const INITIAL_PROJECT_SITES: ProjectSiteItem[] = [
  {
    id: "PRJ-001",
    name: "Central Mall VRF HVAC Installation",
    client: "DLF Retail Corp",
    siteLocation: "Sector 18, Level 3 Plant Room, MG Road",
    managerId: 2,
    managerName: "Alex Manager",
    status: "In Progress",
    startDate: "12 Oct, 2026",
    dueDate: "20 Nov, 2026",
    workers: [
      { id: 4, name: "Rahul Kumar", email: "worker1@123", role: "worker", phone: "+91 98765 43210" },
      { id: 5, name: "Mohammed Zafar", email: "worker2@123", role: "worker", phone: "+91 98765 77889" },
      { id: 6, name: "Amit Das", email: "worker3@123", role: "worker", phone: "+91 98765 11223" },
    ],
    description: "Installation and pressure testing of 12 VRF outdoor units and 48 indoor ceiling cassettes.",
  },
  {
    id: "PRJ-002",
    name: "Tech Park Server Room Precision Cooling",
    client: "Infosys Tech Park",
    siteLocation: "Tower B, Basement 1 Critical IT Lab",
    managerId: 2,
    managerName: "Alex Manager",
    status: "In Progress",
    startDate: "15 Oct, 2026",
    dueDate: "05 Dec, 2026",
    workers: [
      { id: 4, name: "Rahul Kumar", email: "worker1@123", role: "worker", phone: "+91 98765 43210" },
      { id: 6, name: "Amit Das", email: "worker3@123", role: "worker", phone: "+91 98765 11223" },
    ],
    description: "Dual redundant precision DX air conditioning units with copper piping and remote monitoring.",
  },
  {
    id: "PRJ-003",
    name: "City Hospital Wing B Ventilation Retrofit",
    client: "Max Healthcare",
    siteLocation: "Wing B, Isolation Wards & OT Floor",
    managerId: 1,
    managerName: "System Admin",
    status: "Planning",
    startDate: "22 Oct, 2026",
    dueDate: "10 Jan, 2027",
    workers: [
      { id: 5, name: "Mohammed Zafar", email: "worker2@123", role: "worker", phone: "+91 98765 77889" },
    ],
    description: "Negative pressure air handling system, HEPA filtration ductwork, and automated damper controls.",
  },
];
