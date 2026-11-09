export type ToolCondition = "Brand New" | "Good" | "Fair" | "Rough" | "Damaged" | "Scrapped" | "Lost";
export type ToolStatus = "Available" | "In Use" | "In Field" | "Needs Repair" | "Retired" | "Lost";

export interface ToolJourneyEvent {
  id: string;
  eventType: "CREATED" | "ASSIGNED" | "RETURNED" | "MAINTENANCE_SENT" | "MAINTENANCE_RETURNED" | "SCRAPPED";
  title: string;
  subtitle: string;
  badgeLabel: string;
  badgeVariant: "good" | "rough" | "repair" | "scrapped";
  timestamp: string;
  workerName?: string;
  workerId?: string;
  projectName?: string;
  handledBy?: string;
  conditionBefore?: ToolCondition;
  conditionAfter?: ToolCondition;
  noteText?: string;
  noteImage?: string;
  isCurrent?: boolean;
}

export interface ActiveAssignment {
  workerId: string;
  workerName: string;
  projectName: string;
  projectShortName?: string;
  assignedDate: string;
  expectedReturnDate: string;
  isOverdue?: boolean;
  assignedCondition: ToolCondition;
}

export interface ToolItem {
  id: string;
  toolCode: string;
  name: string;
  category: string;
  brand: string;
  modelNo: string;
  serialNo: string;
  imageUrl?: string;
  purchaseDate: string;
  purchaseCost: number;
  currentCondition: ToolCondition;
  status: ToolStatus;
  assignedTo?: ActiveAssignment | null;
  storageLocation: string;
  journey: ToolJourneyEvent[];
  notesList?: { id: string; author: string; date: string; text: string }[];
}

export const WORKERS_LIST = [
  { id: "W-101", name: "Rahul Kumar", phone: "+91 98765 43210", trade: "Senior HVAC Technician" },
  { id: "W-102", name: "Mohammed Zafar", phone: "+91 98765 77889", trade: "Brazing Specialist" },
  { id: "W-103", name: "Amit Das", phone: "+91 98765 11223", trade: "Commissioning Specialist" },
  { id: "W-104", name: "Amit Sharma", phone: "+91 98765 33445", trade: "VRF Piping Tech" },
  { id: "W-105", name: "Vikram Singh", phone: "+91 98765 55667", trade: "Ducting Fitter" },
];

export const PROJECTS_LIST = [
  { full: "Central Mall VRF Installation", short: "VRF Installation" },
  { full: "Grand Hyatt HVAC Commissioning", short: "Commissioning" },
  { full: "Apollo Hospital Chiller Overhaul", short: "Chiller Overhaul" },
  { full: "Metro Station AHU Maintenance", short: "AHU Maintenance" },
  { full: "Tech Park Block 4 Ducting", short: "Ducting" },
];

export const TOOL_CATEGORIES = [
  "Vacuum & Recovery",
  "Digital Gauges & Manifolds",
  "Core Cutting & Power Drills",
  "Brazing & Soldering Sets",
  "Flaring & Bending Tools",
];

export const INITIAL_TOOLS: ToolItem[] = [
  {
    id: "tool-1",
    toolCode: "TL-VP-001",
    name: "Robinair Rotary Vacuum Pump",
    category: "Vacuum & Recovery",
    brand: "Robinaire",
    modelNo: "15500-VacuMaster",
    serialNo: "RB-2023-8841",
    imageUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=120&auto=format&fit=crop&q=80",
    purchaseDate: "2024-02-15",
    purchaseCost: 28500,
    currentCondition: "Good",
    status: "In Use",
    storageLocation: "Crib, Bay A-1",
    assignedTo: {
      workerId: "W-101",
      workerName: "Rahul Kumar",
      projectName: "Central Mall VRF Installation",
      projectShortName: "VRF Installation",
      assignedDate: "09 Nov 2026, 10:30 AM",
      expectedReturnDate: "12 Nov 2026, 06:00 PM",
      isOverdue: false,
      assignedCondition: "Good",
    },
    notesList: [
      { id: "n-1", author: "Store Manager", date: "28 Oct 2026", text: "Minor dent noticed on side casing during return inspection." },
      { id: "n-2", author: "Bosch Workshop", date: "21 Oct 2026", text: "Dent fixed and motor vacuum pull calibrated to 15 microns." },
      { id: "n-3", author: "Store Manager", date: "10 Oct 2026", text: "Initial inspection: oil reservoir topped up and tested OK." },
    ],
    journey: [
      {
        id: "j-1",
        eventType: "ASSIGNED",
        title: "Assigned to Rahul Kumar",
        subtitle: "Taken for VRF Installation",
        badgeLabel: "Condition at Handover: Good",
        badgeVariant: "good",
        timestamp: "09 Nov 2026, 10:30 AM",
        workerName: "Rahul Kumar",
        projectName: "VRF Installation",
        isCurrent: true,
      },
      {
        id: "j-2",
        eventType: "RETURNED",
        title: "Returned by Rahul Kumar",
        subtitle: "Back to store",
        badgeLabel: "Condition at Return: Rough",
        badgeVariant: "rough",
        timestamp: "28 Oct 2026, 04:20 PM",
        workerName: "Rahul Kumar",
        noteText: "Note: Minor dent on side.",
        noteImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=80&auto=format&fit=crop&q=60",
      },
      {
        id: "j-3",
        eventType: "MAINTENANCE_SENT",
        title: "Sent for Repair",
        subtitle: "Marked by Store Manager",
        badgeLabel: "Status: Under Repair",
        badgeVariant: "repair",
        timestamp: "21 Oct 2026, 02:15 PM",
        noteText: "Dent fixed and tested.",
      },
      {
        id: "j-4",
        eventType: "MAINTENANCE_RETURNED",
        title: "Returned to Store",
        subtitle: "After repair",
        badgeLabel: "Condition: Good",
        badgeVariant: "good",
        timestamp: "16 Oct 2026, 05:10 PM",
      },
      {
        id: "j-5",
        eventType: "ASSIGNED",
        title: "Assigned to Amit Das",
        subtitle: "For Commissioning",
        badgeLabel: "Condition at Handover: Good",
        badgeVariant: "good",
        timestamp: "12 Oct 2026, 09:00 AM",
        workerName: "Amit Das",
        projectName: "Commissioning",
      },
      {
        id: "j-6",
        eventType: "CREATED",
        title: "Added to Inventory",
        subtitle: "Added by Store Manager",
        badgeLabel: "Initial Condition: Good",
        badgeVariant: "good",
        timestamp: "10 Oct 2026, 11:00 AM",
      },
    ],
  },
  {
    id: "tool-2",
    toolCode: "TL-DG-003",
    name: "Fieldpiece 4-Port Digital Manifold Gauge",
    category: "Digital Gauges & Manifolds",
    brand: "Fieldpiece",
    modelNo: "SM480V",
    serialNo: "FP-8874-901",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=120&auto=format&fit=crop&q=80",
    purchaseDate: "2024-05-10",
    purchaseCost: 34000,
    currentCondition: "Good",
    status: "Available",
    storageLocation: "Cabinet 2, Shelf B",
    assignedTo: null,
    notesList: [
      { id: "n-1", author: "Store Manager", date: "05 Nov 2026", text: "Returned in pristine condition with all port caps attached." },
    ],
    journey: [
      {
        id: "j-11",
        eventType: "RETURNED",
        title: "Returned to Store",
        subtitle: "Returned by Amit Sharma",
        badgeLabel: "Condition: Good",
        badgeVariant: "good",
        timestamp: "05 Nov 2026, 04:30 PM",
        isCurrent: true,
      },
      {
        id: "j-12",
        eventType: "ASSIGNED",
        title: "Assigned to Amit Sharma",
        subtitle: "For Metro Station AHU",
        badgeLabel: "Condition at Handover: Good",
        badgeVariant: "good",
        timestamp: "02 Nov 2026, 08:30 AM",
      },
      {
        id: "j-13",
        eventType: "CREATED",
        title: "Added to Inventory",
        subtitle: "Added by Store Manager",
        badgeLabel: "Initial Condition: Good",
        badgeVariant: "good",
        timestamp: "10 May 2024, 11:30 AM",
      },
    ],
  },
  {
    id: "tool-3",
    toolCode: "TL-CC-007",
    name: "Bosch Heavy Rotary Hammer Drill",
    category: "Core Cutting & Power Drills",
    brand: "Bosch",
    modelNo: "GBH 5-40 DCE",
    serialNo: "BSH-2022-4419",
    imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=120&auto=format&fit=crop&q=80",
    purchaseDate: "2023-08-19",
    purchaseCost: 42000,
    currentCondition: "Damaged",
    status: "Needs Repair",
    storageLocation: "Repair Workshop, Bay 4",
    assignedTo: null,
    notesList: [
      { id: "n-1", author: "Vikram Singh", date: "01 Nov 2026", text: "Chuck overheating and trigger switch intermittent." },
    ],
    journey: [
      {
        id: "j-21",
        eventType: "MAINTENANCE_SENT",
        title: "Sent for Repair",
        subtitle: "Marked by Store Manager",
        badgeLabel: "Status: Under Repair",
        badgeVariant: "repair",
        timestamp: "02 Nov 2026, 02:00 PM",
        noteText: "Armature replacement order placed.",
        isCurrent: true,
      },
      {
        id: "j-22",
        eventType: "RETURNED",
        title: "Returned by Vikram Singh",
        subtitle: "Back to store",
        badgeLabel: "Condition at Return: Damaged",
        badgeVariant: "rough",
        timestamp: "01 Nov 2026, 10:15 AM",
        noteText: "Trigger switch jammed.",
      },
      {
        id: "j-23",
        eventType: "CREATED",
        title: "Added to Inventory",
        subtitle: "Added by Store Manager",
        badgeLabel: "Initial Condition: Good",
        badgeVariant: "good",
        timestamp: "19 Aug 2023, 12:00 PM",
      },
    ],
  },
  {
    id: "tool-4",
    toolCode: "TL-BZ-012",
    name: "Oxy-Acetylene Brazing Torch Set",
    category: "Brazing & Soldering Sets",
    brand: "Harris",
    modelNo: "HVAC-Pro 400",
    serialNo: "HRS-2024-110",
    imageUrl: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=120&auto=format&fit=crop&q=80",
    purchaseDate: "2024-01-20",
    purchaseCost: 19500,
    currentCondition: "Fair",
    status: "In Field",
    storageLocation: "Gas Locker B",
    assignedTo: {
      workerId: "W-102",
      workerName: "Mohammed Zafar",
      projectName: "Grand Hyatt HVAC Commissioning",
      projectShortName: "Commissioning",
      assignedDate: "04 Nov 2026, 08:00 AM",
      expectedReturnDate: "06 Nov 2026, 06:00 PM",
      isOverdue: true,
      assignedCondition: "Fair",
    },
    journey: [
      {
        id: "j-31",
        eventType: "ASSIGNED",
        title: "Assigned to Mohammed Zafar",
        subtitle: "Taken for Commissioning",
        badgeLabel: "Condition at Handover: Fair",
        badgeVariant: "rough",
        timestamp: "04 Nov 2026, 08:00 AM",
        isCurrent: true,
      },
      {
        id: "j-32",
        eventType: "CREATED",
        title: "Added to Inventory",
        subtitle: "Added by Store Manager",
        badgeLabel: "Initial Condition: Brand New",
        badgeVariant: "good",
        timestamp: "20 Jan 2024, 09:30 AM",
      },
    ],
  },
  {
    id: "tool-5",
    toolCode: "TL-RC-002",
    name: "Appion G5Twin Refrigerant Recovery Machine",
    category: "Vacuum & Recovery",
    brand: "Appion",
    modelNo: "G5Twin",
    serialNo: "APN-9981-303",
    imageUrl: "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=120&auto=format&fit=crop&q=80",
    purchaseDate: "2024-03-25",
    purchaseCost: 65000,
    currentCondition: "Good",
    status: "Available",
    storageLocation: "Crib, Bay A-3",
    assignedTo: null,
    journey: [
      {
        id: "j-40",
        eventType: "CREATED",
        title: "Added to Inventory",
        subtitle: "Added by Store Manager",
        badgeLabel: "Initial Condition: Brand New",
        badgeVariant: "good",
        timestamp: "25 Mar 2024, 10:00 AM",
        isCurrent: true,
      },
    ],
  },
  {
    id: "tool-6",
    toolCode: "TL-FL-018",
    name: "Eccentric Cone R-410A Flaring Tool Kit",
    category: "Flaring & Bending Tools",
    brand: "Imperial / Value",
    modelNo: "VFT-808-MIS",
    serialNo: "VAL-2022-771",
    imageUrl: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=120&auto=format&fit=crop&q=80",
    purchaseDate: "2022-09-11",
    purchaseCost: 8500,
    currentCondition: "Scrapped",
    status: "Retired",
    storageLocation: "Scrap Bin #1",
    assignedTo: null,
    journey: [
      {
        id: "j-51",
        eventType: "SCRAPPED",
        title: "Decommissioned / Scrapped",
        subtitle: "Marked by Store Manager",
        badgeLabel: "Status: Retired",
        badgeVariant: "scrapped",
        timestamp: "15 Oct 2026, 03:00 PM",
        noteText: "Cone stripped and frame cracked after 4 years of use. BER.",
        isCurrent: true,
      },
      {
        id: "j-52",
        eventType: "CREATED",
        title: "Added to Inventory",
        subtitle: "Added by Store Manager",
        badgeLabel: "Initial Condition: Brand New",
        badgeVariant: "good",
        timestamp: "11 Sep 2022, 11:00 AM",
      },
    ],
  },
];
