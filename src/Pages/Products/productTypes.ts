export interface ProductVariant {
  id: string;
  sizeLabel: string;
  sku: string;
  stock: number;
  minThreshold: number;
  unitCost: number;
}

export interface ProductItem {
  id: string;
  name: string;
  brand: string;
  categoryName: string;
  subCategoryName?: string;
  baseUom: string;
  packageUom?: string;
  packageRatio?: number;
  hasVariants: boolean;
  variants: ProductVariant[];
}

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: "PRD-001",
    name: "VRF Grade Seamless Copper Pipe",
    brand: "Mandev / Indigo",
    categoryName: "Ducting & Piping Materials",
    subCategoryName: "Copper Pipes & Tubes",
    baseUom: "Meters",
    packageUom: "Coils (15m)",
    packageRatio: 15,
    hasVariants: true,
    variants: [
      { id: "var-1", sizeLabel: "1/4\" (6.35 mm)", sku: "CU-025-MTR", stock: 45.0, minThreshold: 15.0, unitCost: 140 },
      { id: "var-2", sizeLabel: "3/8\" (9.52 mm)", sku: "CU-038-MTR", stock: 32.5, minThreshold: 15.0, unitCost: 220 },
      { id: "var-3", sizeLabel: "1/2\" (12.7 mm)", sku: "CU-050-MTR", stock: 18.0, minThreshold: 15.0, unitCost: 310 },
      { id: "var-4", sizeLabel: "5/8\" (15.88 mm)", sku: "CU-062-MTR", stock: 4.5, minThreshold: 15.0, unitCost: 420 },
      { id: "var-5", sizeLabel: "3/4\" (19.05 mm)", sku: "CU-075-MTR", stock: 0.0, minThreshold: 10.0, unitCost: 560 },
    ],
  },
  {
    id: "PRD-002",
    name: "Pure Fluorinated Refrigerant Gas",
    brand: "Chemours / Floron",
    categoryName: "Consumables & Gases",
    subCategoryName: "Refrigerant Gases",
    baseUom: "Kg",
    packageUom: "Cylinders",
    packageRatio: 10,
    hasVariants: true,
    variants: [
      { id: "var-6", sizeLabel: "R-410A Gas (Eco Blend)", sku: "GAS-R410A-KG", stock: 18.5, minThreshold: 10.0, unitCost: 650 },
      { id: "var-7", sizeLabel: "R-32 Inverter Gas", sku: "GAS-R32-KG", stock: 8.2, minThreshold: 10.0, unitCost: 780 },
      { id: "var-8", sizeLabel: "R-134a Chiller Gas", sku: "GAS-R134A-KG", stock: 24.0, minThreshold: 10.0, unitCost: 590 },
    ],
  },
  {
    id: "PRD-003",
    name: "Nitrile Rubber Closed-Cell Pipe Insulation",
    brand: "Aeroflex / Armacell",
    categoryName: "Ducting & Piping Materials",
    subCategoryName: "Thermal Pipe Insulation",
    baseUom: "Meters",
    packageUom: "Boxes",
    packageRatio: 20,
    hasVariants: true,
    variants: [
      { id: "var-9", sizeLabel: "1/4\" x 9mm Wall", sku: "INS-025-09", stock: 54.0, minThreshold: 20.0, unitCost: 35 },
      { id: "var-10", sizeLabel: "3/8\" x 9mm Wall", sku: "INS-038-09", stock: 38.0, minThreshold: 20.0, unitCost: 45 },
      { id: "var-11", sizeLabel: "1/2\" x 13mm Wall", sku: "INS-050-13", stock: 12.0, minThreshold: 20.0, unitCost: 65 },
    ],
  },
  {
    id: "PRD-004",
    name: "VRV IV-X 10 HP Outdoor Unit",
    brand: "Daikin",
    categoryName: "HVAC Equipment & Units",
    subCategoryName: "VRF / VRV Systems",
    baseUom: "Pieces",
    hasVariants: false,
    variants: [
      { id: "var-12", sizeLabel: "Standard Unit (10 HP)", sku: "DKN-VRV-10HP", stock: 2.0, minThreshold: 1.0, unitCost: 285000 },
    ],
  },
  {
    id: "PRD-005",
    name: "Smart Digital Touch Modbus Thermostat",
    brand: "Honeywell / Schneider",
    categoryName: "HVAC Equipment & Units",
    subCategoryName: "Ductable Split Units",
    baseUom: "Pieces",
    hasVariants: false,
    variants: [
      { id: "var-13", sizeLabel: "24V AC Backlit", sku: "HNY-TH-MB24", stock: 16.0, minThreshold: 5.0, unitCost: 3400 },
    ],
  },
];
