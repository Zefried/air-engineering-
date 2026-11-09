export type ToolCondition = "Brand New" | "Good" | "Fair" | "Rough" | "Damaged" | "Scrapped" | "Lost";
export type ToolStatus = "Available" | "In Field" | "Needs Repair" | "Retired" | "Lost";

export interface ToolJourneyEvent {
  id: string;
  eventType: "CREATED" | "ASSIGNED" | "RETURNED" | "MAINTENANCE_SENT" | "MAINTENANCE_RETURNED" | "SCRAPPED";
  timestamp: string;
  workerName?: string;
  workerId?: string;
  projectName?: string;
  handledBy: string;
  conditionBefore?: ToolCondition;
  conditionAfter?: ToolCondition;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  isOverdue?: boolean;
  notes?: string;
  repairCost?: number;
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
}

export const WORKERS_LIST = [
  { id: "W-101", name: "Rahul Kumar", phone: "+91 98765 43210", trade: "Senior HVAC Technician" },
  { id: "W-102", name: "Mohammed Zafar", phone: "+91 98765 77889", trade: "Brazing Specialist" },
  { id: "W-103", name: "Suresh Verma", phone: "+91 98765 11223", trade: "Chiller Specialist" },
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
    name: "Robinair 2-Stage Rotary Vacuum Pump",
    category: "Vacuum & Recovery",
    brand: "Robinair",
    modelNo: "15500",
    serialNo: "RB-2023-8841",
    imageUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=120&auto=format&fit=crop&q=80",
    purchaseDate: "2024-02-15",
    purchaseCost: 28500,
    currentCondition: "Good",
    status: "In Field",
    storageLocation: "Crib, Bay A-1",
    assignedTo: {
      workerId: "W-101",
      workerName: "Rahul Kumar",
      projectName: "Central Mall VRF Installation",
      projectShortName: "VRF Installation",
      assignedDate: "2026-11-07 08:30",
      expectedReturnDate: "2026-11-09 18:00",
      isOverdue: false,
      assignedCondition: "Good",
    },
    journey: [
      {
        id: "j-1",
        eventType: "CREATED",
        timestamp: "2024-02-15 10:00",
        handledBy: "Admin",
        conditionAfter: "Brand New",
        notes: "Registered into fleet inventory with factory calibration certificate.",
      },
      {
        id: "j-2",
        eventType: "ASSIGNED",
        timestamp: "2026-11-07 08:30",
        workerName: "Rahul Kumar",
        projectName: "Central Mall VRF Installation",
        handledBy: "Manager Alex",
        conditionBefore: "Good",
        expectedReturnDate: "2026-11-09 18:00",
        notes: "Assigned for VRF line evacuation. Dispatched in Good condition.",
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
    journey: [
      {
        id: "j-10",
        eventType: "CREATED",
        timestamp: "2024-05-10 11:30",
        handledBy: "Admin",
        conditionAfter: "Brand New",
      },
      {
        id: "j-11",
        eventType: "RETURNED",
        timestamp: "2026-11-05 16:30",
        workerName: "Amit Sharma",
        projectName: "Metro Station AHU Maintenance",
        handledBy: "Manager Alex",
        conditionAfter: "Good",
        notes: "Returned clean. Checked all 4 port valves and micron sensor.",
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
    journey: [
      {
        id: "j-20",
        eventType: "CREATED",
        timestamp: "2023-08-19 12:00",
        handledBy: "Admin",
        conditionAfter: "Brand New",
      },
      {
        id: "j-21",
        eventType: "RETURNED",
        timestamp: "2026-11-01 10:15",
        workerName: "Vikram Singh",
        projectName: "Tech Park Block 4 Ducting",
        handledBy: "Manager Alex",
        conditionBefore: "Good",
        conditionAfter: "Damaged",
        isOverdue: true,
        notes: "Trigger switch jammed and chuck overheating with sparks. Condition degraded from Good to Damaged under Vikram Singh.",
      },
      {
        id: "j-22",
        eventType: "MAINTENANCE_SENT",
        timestamp: "2026-11-02 14:00",
        handledBy: "Admin",
        notes: "Sent to Bosch Authorized Service Center for armature repair.",
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
      assignedDate: "2026-11-04 08:00",
      expectedReturnDate: "2026-11-06 18:00",
      isOverdue: true,
      assignedCondition: "Fair",
    },
    journey: [
      {
        id: "j-30",
        eventType: "CREATED",
        timestamp: "2024-01-20 09:30",
        handledBy: "Admin",
        conditionAfter: "Brand New",
      },
      {
        id: "j-31",
        eventType: "ASSIGNED",
        timestamp: "2026-11-04 08:00",
        workerName: "Mohammed Zafar",
        projectName: "Grand Hyatt HVAC Commissioning",
        handledBy: "Manager Alex",
        conditionBefore: "Fair",
        expectedReturnDate: "2026-11-06 18:00",
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
        timestamp: "2024-03-25 10:00",
        handledBy: "Admin",
        conditionAfter: "Brand New",
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
        id: "j-50",
        eventType: "CREATED",
        timestamp: "2022-09-11 11:00",
        handledBy: "Admin",
        conditionAfter: "Brand New",
      },
      {
        id: "j-51",
        eventType: "SCRAPPED",
        timestamp: "2026-10-15 15:00",
        handledBy: "Admin",
        conditionBefore: "Damaged",
        conditionAfter: "Scrapped",
        notes: "Cone stripped and frame cracked after 4 years of continuous field use. Beyond Economic Repair (BER).",
      },
    ],
  },
];
