/**
 * Demo data for client presentation.
 * Realistic Indian employee names, departments, benefit claims, and policy brackets.
 * Used as fallback when API returns empty or setupRequired.
 */

import type { Employee, Claim, SalaryBand } from "../types";
import { FLEXI_BENEFIT_CATEGORIES } from "../types";

// ─── Employees ───────────────────────────────────────────────────────────────

const COLORS = ["#3D41FA","#27AE60","#E74C3C","#F39C12","#9B59B6","#1ABC9C","#E67E22","#2C3E50","#16A085","#D35400","#8E44AD","#2980B9","#C0392B","#F1C40F","#7F8C8D"];

export const DEMO_EMPLOYEES: Employee[] = [
  { id: "EMP-001", name: "Raj Patel", initials: "RP", color: COLORS[0], department: "Engineering", designation: "Senior Associate", salary: "₹7,50,000", bracket: "₹5L – ₹8L", benefitPlan: "Senior Associate", status: "active", email: "raj.patel@acme.com", phone: "9876543210", location: "Mumbai", taxRegime: "new" },
  { id: "EMP-002", name: "Priya Sharma", initials: "PS", color: COLORS[1], department: "Human Resources", designation: "Associate", salary: "₹4,50,000", bracket: "₹2.5L – ₹5L", benefitPlan: "Associate", status: "active", email: "priya.sharma@acme.com", phone: "9876543211", location: "Bengaluru", taxRegime: "old" },
  { id: "EMP-003", name: "Arjun Singh", initials: "AS", color: COLORS[2], department: "Engineering", designation: "Senior Manager", salary: "₹15,00,000", bracket: "₹12L – ₹18L", benefitPlan: "Senior Manager", status: "active", email: "arjun.singh@acme.com", phone: "9876543212", location: "Delhi", taxRegime: "new" },
  { id: "EMP-004", name: "Sneha Gupta", initials: "SG", color: COLORS[3], department: "Product", designation: "Manager", salary: "₹10,00,000", bracket: "₹8L – ₹12L", benefitPlan: "Manager", status: "active", email: "sneha.gupta@acme.com", phone: "9876543213", location: "Hyderabad", taxRegime: "old" },
  { id: "EMP-005", name: "Vikram Reddy", initials: "VR", color: COLORS[4], department: "Sales", designation: "AVP", salary: "₹20,00,000", bracket: "₹18L – ₹25L", benefitPlan: "AVP", status: "active", email: "vikram.reddy@acme.com", phone: "9876543214", location: "Chennai", taxRegime: "new" },
  { id: "EMP-006", name: "Anita Desai", initials: "AD", color: COLORS[5], department: "Finance", designation: "Manager", salary: "₹9,50,000", bracket: "₹8L – ₹12L", benefitPlan: "Manager", status: "active", email: "anita.desai@acme.com", phone: "9876543215", location: "Mumbai", taxRegime: "old" },
  { id: "EMP-007", name: "Karthik Iyer", initials: "KI", color: COLORS[6], department: "Engineering", designation: "Associate", salary: "₹4,20,000", bracket: "₹2.5L – ₹5L", benefitPlan: "Associate", status: "active", email: "karthik.iyer@acme.com", phone: "9876543216", location: "Bengaluru", taxRegime: "new" },
  { id: "EMP-008", name: "Meera Joshi", initials: "MJ", color: COLORS[7], department: "Marketing", designation: "Senior Associate", salary: "₹6,80,000", bracket: "₹5L – ₹8L", benefitPlan: "Senior Associate", status: "active", email: "meera.joshi@acme.com", phone: "9876543217", location: "Pune", taxRegime: "new" },
  { id: "EMP-009", name: "Rohit Dalal", initials: "RD", color: COLORS[8], department: "Operations", designation: "Senior Associate", salary: "₹6,00,000", bracket: "₹5L – ₹8L", benefitPlan: "Senior Associate", status: "active", email: "rohit.dalal@acme.com", phone: "9876543218", location: "Gurugram", taxRegime: "old" },
  { id: "EMP-010", name: "Deepika Nair", initials: "DN", color: COLORS[9], department: "Engineering", designation: "Senior Associate", salary: "₹7,00,000", bracket: "₹5L – ₹8L", benefitPlan: "Senior Associate", status: "active", email: "deepika.nair@acme.com", phone: "9876543219", location: "Kochi", taxRegime: "new" },
  { id: "EMP-011", name: "Amit Verma", initials: "AV", color: COLORS[10], department: "Engineering", designation: "Manager", salary: "₹10,50,000", bracket: "₹8L – ₹12L", benefitPlan: "Manager", status: "active", email: "amit.verma@acme.com", phone: "9876543220", location: "Noida", taxRegime: "old" },
  { id: "EMP-012", name: "Lakshmi Pillai", initials: "LP", color: COLORS[11], department: "Legal", designation: "Senior Manager", salary: "₹14,00,000", bracket: "₹12L – ₹18L", benefitPlan: "Senior Manager", status: "active", email: "lakshmi.pillai@acme.com", phone: "9876543221", location: "Mumbai", taxRegime: "new" },
  { id: "EMP-013", name: "Sanjay Mehta", initials: "SM", color: COLORS[12], department: "Sales", designation: "Associate", salary: "₹3,80,000", bracket: "₹2.5L – ₹5L", benefitPlan: "Associate", status: "active", email: "sanjay.mehta@acme.com", phone: "9876543222", location: "Ahmedabad", taxRegime: "old" },
  { id: "EMP-014", name: "Nisha Kapoor", initials: "NK", color: COLORS[13], department: "Design", designation: "Senior Associate", salary: "₹7,20,000", bracket: "₹5L – ₹8L", benefitPlan: "Senior Associate", status: "active", email: "nisha.kapoor@acme.com", phone: "9876543223", location: "Bengaluru", taxRegime: "new" },
  { id: "EMP-015", name: "Rahul Khanna", initials: "RK", color: COLORS[14], department: "Product", designation: "VP", salary: "₹28,00,000", bracket: "₹25L+", benefitPlan: "VP", status: "active", email: "rahul.khanna@acme.com", phone: "9876543224", location: "Delhi", taxRegime: "new" },
  { id: "EMP-016", name: "Pooja Rajan", initials: "PR", color: COLORS[0], department: "Human Resources", designation: "Associate", salary: "₹3,50,000", bracket: "₹2.5L – ₹5L", benefitPlan: "Associate", status: "active", email: "pooja.rajan@acme.com", phone: "9876543225", location: "Chennai", taxRegime: "old" },
  { id: "EMP-017", name: "Suresh Kumar", initials: "SK", color: COLORS[1], department: "Finance", designation: "Senior Associate", salary: "₹5,50,000", bracket: "₹5L – ₹8L", benefitPlan: "Senior Associate", status: "on-leave", email: "suresh.kumar@acme.com", phone: "9876543226", location: "Jaipur", taxRegime: "new" },
  { id: "EMP-018", name: "Kavitha Menon", initials: "KM", color: COLORS[2], department: "Engineering", designation: "Manager", salary: "₹9,00,000", bracket: "₹8L – ₹12L", benefitPlan: "Manager", status: "active", email: "kavitha.menon@acme.com", phone: "9876543227", location: "Thiruvananthapuram", taxRegime: "old" },
  { id: "EMP-019", name: "Aditya Bhatt", initials: "AB", color: COLORS[3], department: "Marketing", designation: "Associate", salary: "₹3,20,000", bracket: "₹2.5L – ₹5L", benefitPlan: "Associate", status: "active", email: "aditya.bhatt@acme.com", phone: "9876543228", location: "Pune", taxRegime: "new" },
  { id: "EMP-020", name: "Divya Rao", initials: "DR", color: COLORS[4], department: "Operations", designation: "AVP", salary: "₹22,00,000", bracket: "₹18L – ₹25L", benefitPlan: "AVP", status: "active", email: "divya.rao@acme.com", phone: "9876543229", location: "Bengaluru", taxRegime: "old" },
];

// ─── Claims ──────────────────────────────────────────────────────────────────

const BENEFIT_TYPES = [
  "Food Allowance", "Fuel Allowance", "Phone/Internet Allowance",
  "Children's Education Allowance", "Health and Fitness Allowance",
  "Business Travel Allowance", "Books and Periodicals",
  "Professional Development Allowance", "Uniform Allowance", "Gift Allowance",
];

function randomDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  return d.toISOString().split("T")[0];
}

function randomAmount(min: number, max: number): string {
  const val = Math.round((Math.random() * (max - min) + min) / 100) * 100;
  return `₹${val.toLocaleString("en-IN")}`;
}

export const DEMO_CLAIMS: Claim[] = [
  // Pending claims (for approval demo)
  { id: "CLM-1001", employeeName: "Raj Patel", employeeId: "EMP-001", initials: "RP", avatarColor: COLORS[0], department: "Engineering", benefitType: "Fuel Allowance", category: "Fuel", claimAmount: "₹3,200", dateSubmitted: randomDate(3), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Petrol bill - Indian Oil, Andheri", merchantName: "Indian Oil Corp", transactionId: "UPI-78392014", salaryBand: "₹5L – ₹8L", approvalTag: "manual" },
  { id: "CLM-1002", employeeName: "Priya Sharma", employeeId: "EMP-002", initials: "PS", avatarColor: COLORS[1], department: "Human Resources", benefitType: "Food Allowance", category: "Food", claimAmount: "₹2,500", dateSubmitted: randomDate(2), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Swiggy monthly food subscription", merchantName: "Swiggy", transactionId: "UPI-48291037", salaryBand: "₹2.5L – ₹5L", approvalTag: "auto" },
  { id: "CLM-1003", employeeName: "Arjun Singh", employeeId: "EMP-003", initials: "AS", avatarColor: COLORS[2], department: "Engineering", benefitType: "Phone/Internet Allowance", category: "Phone/Internet", claimAmount: "₹1,499", dateSubmitted: randomDate(1), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Airtel fiber monthly bill", merchantName: "Airtel", transactionId: "UPI-92817364", salaryBand: "₹12L – ₹18L", approvalTag: "auto" },
  { id: "CLM-1004", employeeName: "Sneha Gupta", employeeId: "EMP-004", initials: "SG", avatarColor: COLORS[3], department: "Product", benefitType: "Health and Fitness Allowance", category: "Health", claimAmount: "₹4,500", dateSubmitted: randomDate(4), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Cult.fit quarterly membership", merchantName: "Cult.fit", transactionId: "UPI-12938475", salaryBand: "₹8L – ₹12L", approvalTag: "manual" },
  { id: "CLM-1005", employeeName: "Vikram Reddy", employeeId: "EMP-005", initials: "VR", avatarColor: COLORS[4], department: "Sales", benefitType: "Business Travel Allowance", category: "Travel", claimAmount: "₹12,800", dateSubmitted: randomDate(5), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Client visit - Mumbai to Delhi flight", merchantName: "IndiGo Airlines", transactionId: "UPI-56473829", salaryBand: "₹18L – ₹25L", approvalTag: "escalated" },
  { id: "CLM-1006", employeeName: "Meera Joshi", employeeId: "EMP-008", initials: "MJ", avatarColor: COLORS[7], department: "Marketing", benefitType: "Books and Periodicals", category: "Education", claimAmount: "₹1,200", dateSubmitted: randomDate(2), status: "pending", upiScreenshot: undefined, receiptDescription: "Marketing textbook - Amazon", merchantName: "Amazon India", transactionId: "UPI-38291047", salaryBand: "₹5L – ₹8L", approvalTag: "auto" },
  { id: "CLM-1007", employeeName: "Deepika Nair", employeeId: "EMP-010", initials: "DN", avatarColor: COLORS[9], department: "Engineering", benefitType: "Professional Development Allowance", category: "Education", claimAmount: "₹8,500", dateSubmitted: randomDate(6), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "AWS Certification course", merchantName: "Udemy", transactionId: "UPI-74829103", salaryBand: "₹5L – ₹8L", approvalTag: "escalated" },
  { id: "CLM-1008", employeeName: "Karthik Iyer", employeeId: "EMP-007", initials: "KI", avatarColor: COLORS[6], department: "Engineering", benefitType: "Food Allowance", category: "Food", claimAmount: "₹2,000", dateSubmitted: randomDate(1), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Zomato monthly meals", merchantName: "Zomato", transactionId: "UPI-29384756", salaryBand: "₹2.5L – ₹5L", approvalTag: "auto" },

  // Approved claims
  { id: "CLM-1009", employeeName: "Anita Desai", employeeId: "EMP-006", initials: "AD", avatarColor: COLORS[5], department: "Finance", benefitType: "Fuel Allowance", category: "Fuel", claimAmount: "₹2,800", dateSubmitted: randomDate(10), status: "approved", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "HP Petrol pump - Worli", actionNote: "Verified fuel receipts. Approved.", actionTimestamp: randomDate(8), actionBy: "Amanda Johnson", merchantName: "HP Petroleum", transactionId: "UPI-83746291", salaryBand: "₹8L – ₹12L", approvalTag: "auto" },
  { id: "CLM-1010", employeeName: "Rohit Dalal", employeeId: "EMP-009", initials: "RD", avatarColor: COLORS[8], department: "Operations", benefitType: "Food Allowance", category: "Food", claimAmount: "₹2,200", dateSubmitted: randomDate(12), status: "approved", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Office lunch meals", actionNote: "Regular food allowance claim. Approved.", actionTimestamp: randomDate(9), actionBy: "Amanda Johnson", merchantName: "Sodexo", transactionId: "UPI-19283746", salaryBand: "₹5L – ₹8L", approvalTag: "auto" },
  { id: "CLM-1011", employeeName: "Amit Verma", employeeId: "EMP-011", initials: "AV", avatarColor: COLORS[10], department: "Engineering", benefitType: "Phone/Internet Allowance", category: "Phone/Internet", claimAmount: "₹999", dateSubmitted: randomDate(15), status: "approved", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Jio fiber plan", actionNote: "Internet bill verified.", actionTimestamp: randomDate(12), actionBy: "Amanda Johnson", merchantName: "Jio", transactionId: "UPI-47382910", salaryBand: "₹8L – ₹12L", approvalTag: "auto" },
  { id: "CLM-1012", employeeName: "Nisha Kapoor", employeeId: "EMP-014", initials: "NK", avatarColor: COLORS[13], department: "Design", benefitType: "Health and Fitness Allowance", category: "Health", claimAmount: "₹3,000", dateSubmitted: randomDate(14), status: "approved", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Gym membership - Gold's Gym", actionNote: "Quarterly gym membership approved.", actionTimestamp: randomDate(11), actionBy: "Amanda Johnson", merchantName: "Gold's Gym", transactionId: "UPI-65748392", salaryBand: "₹5L – ₹8L", approvalTag: "manual" },
  { id: "CLM-1013", employeeName: "Lakshmi Pillai", employeeId: "EMP-012", initials: "LP", avatarColor: COLORS[11], department: "Legal", benefitType: "Books and Periodicals", category: "Education", claimAmount: "₹2,400", dateSubmitted: randomDate(18), status: "approved", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Legal journals subscription", actionNote: "Professional development. Approved.", actionTimestamp: randomDate(15), actionBy: "Amanda Johnson", merchantName: "LexisNexis", transactionId: "UPI-92837461", salaryBand: "₹12L – ₹18L", approvalTag: "auto" },

  // Rejected claims
  { id: "CLM-1014", employeeName: "Sanjay Mehta", employeeId: "EMP-013", initials: "SM", avatarColor: COLORS[12], department: "Sales", benefitType: "Business Travel Allowance", category: "Travel", claimAmount: "₹18,500", dateSubmitted: randomDate(20), status: "rejected", upiScreenshot: undefined, receiptDescription: "Team outing - Goa trip", actionNote: "Personal trip, not business travel. No supporting documents provided. [Amount returned to employee limit]", actionTimestamp: randomDate(17), actionBy: "Amanda Johnson", merchantName: "MakeMyTrip", transactionId: "UPI-38192746", salaryBand: "₹2.5L – ₹5L", approvalTag: "escalated" },
  { id: "CLM-1015", employeeName: "Aditya Bhatt", employeeId: "EMP-019", initials: "AB", avatarColor: COLORS[3], department: "Marketing", benefitType: "Gift Allowance", category: "Other", claimAmount: "₹5,000", dateSubmitted: randomDate(22), status: "rejected", upiScreenshot: undefined, receiptDescription: "Personal shopping - Amazon", actionNote: "Exceeds gift allowance limit. No valid business justification. [Amount returned to employee limit]", actionTimestamp: randomDate(19), actionBy: "Amanda Johnson", merchantName: "Amazon India", transactionId: "UPI-74619283", salaryBand: "₹2.5L – ₹5L", approvalTag: "manual" },

  // More pending for bulk demo
  { id: "CLM-1016", employeeName: "Divya Rao", employeeId: "EMP-020", initials: "DR", avatarColor: COLORS[4], department: "Operations", benefitType: "Fuel Allowance", category: "Fuel", claimAmount: "₹4,100", dateSubmitted: randomDate(1), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "BPCL petrol - 3 fill-ups", merchantName: "BPCL", transactionId: "UPI-84729301", salaryBand: "₹18L – ₹25L", approvalTag: "manual" },
  { id: "CLM-1017", employeeName: "Pooja Rajan", employeeId: "EMP-016", initials: "PR", avatarColor: COLORS[0], department: "Human Resources", benefitType: "Food Allowance", category: "Food", claimAmount: "₹1,800", dateSubmitted: randomDate(2), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Canteen meals - March", merchantName: "Office Canteen", transactionId: "UPI-19384756", salaryBand: "₹2.5L – ₹5L", approvalTag: "auto" },
  { id: "CLM-1018", employeeName: "Suresh Kumar", employeeId: "EMP-017", initials: "SK", avatarColor: COLORS[1], department: "Finance", benefitType: "Phone/Internet Allowance", category: "Phone/Internet", claimAmount: "₹799", dateSubmitted: randomDate(3), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Vi prepaid recharge", merchantName: "Vi (Vodafone Idea)", transactionId: "UPI-47382019", salaryBand: "₹5L – ₹8L", approvalTag: "auto" },
  { id: "CLM-1019", employeeName: "Kavitha Menon", employeeId: "EMP-018", initials: "KM", avatarColor: COLORS[2], department: "Engineering", benefitType: "Children's Education Allowance", category: "Education", claimAmount: "₹6,500", dateSubmitted: randomDate(4), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "School tuition fees - Ryan International", merchantName: "Ryan International School", transactionId: "UPI-65472839", salaryBand: "₹8L – ₹12L", approvalTag: "manual" },
  { id: "CLM-1020", employeeName: "Rahul Khanna", employeeId: "EMP-015", initials: "RK", avatarColor: COLORS[14], department: "Product", benefitType: "Business Travel Allowance", category: "Travel", claimAmount: "₹15,200", dateSubmitted: randomDate(2), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Product conference - BLR to HYD", merchantName: "Air India", transactionId: "UPI-28374910", salaryBand: "₹25L+", approvalTag: "escalated" },
];

// ─── Policy Brackets ─────────────────────────────────────────────────────────

/* Helper: monthly numeric → annual formatted (×12) */
function annualFromMonthly(monthly: string): string {
  const n = parseFloat(String(monthly).replace(/[^0-9.]/g, ""));
  if (isNaN(n)) return "0";
  return (n * 12).toLocaleString("en-IN");
}

/* Helper: given existing enabled benefits (by category key), pad to all 13 categories */
function padBenefits(
  existing: Record<string, { name: string; monthlyLimit: string; billRequired: boolean; carryForward: boolean }>,
) {
  return FLEXI_BENEFIT_CATEGORIES.map(cat => {
    const e = existing[cat.key];
    const base = e
      ? { name: e.name, enabled: true, maxPercent: "0", monthlyLimit: e.monthlyLimit, annualLimit: annualFromMonthly(e.monthlyLimit), billRequired: e.billRequired, carryForward: e.carryForward, category: cat.key }
      : { name: cat.label, enabled: false, maxPercent: "0", monthlyLimit: "0", annualLimit: "0", billRequired: cat.defaultBillRequired, carryForward: false, category: cat.key };
    if (cat.key === "food") {
      return { ...base, perTxnLimit: { enabled: false, amount: "0", basis: "per_meal" as const } };
    }
    return base;
  });
}

export const DEMO_BRACKETS: SalaryBand[] = [
  {
    id: "bracket-assoc", name: "Associate", expanded: false, globalMaxLimit: "₹60,000 / year",
    benefits: padBenefits({
      food: { name: "Food Allowance", monthlyLimit: "2,000", billRequired: false, carryForward: false },
      phone_internet: { name: "Phone / Internet", monthlyLimit: "800", billRequired: true, carryForward: false },
      health_fitness: { name: "Health & Fitness", monthlyLimit: "1,500", billRequired: true, carryForward: false },
      books_periodicals: { name: "Books & Periodicals", monthlyLimit: "600", billRequired: true, carryForward: false },
    }),
  },
  {
    id: "bracket-sr-assoc", name: "Senior Associate", expanded: false, globalMaxLimit: "₹1,40,000 / year",
    benefits: padBenefits({
      food: { name: "Food Allowance", monthlyLimit: "3,000", billRequired: false, carryForward: false },
      fuel: { name: "Fuel Allowance", monthlyLimit: "3,000", billRequired: true, carryForward: false },
      phone_internet: { name: "Phone / Internet", monthlyLimit: "1,200", billRequired: true, carryForward: true },
      children_education: { name: "Children's Education", monthlyLimit: "1,500", billRequired: true, carryForward: true },
      health_fitness: { name: "Health & Fitness", monthlyLimit: "2,500", billRequired: true, carryForward: false },
      books_periodicals: { name: "Books & Periodicals", monthlyLimit: "1,000", billRequired: true, carryForward: false },
    }),
  },
  {
    id: "bracket-mgr", name: "Manager", expanded: false, globalMaxLimit: "₹2,80,000 / year",
    benefits: padBenefits({
      food: { name: "Food Allowance", monthlyLimit: "4,500", billRequired: false, carryForward: false },
      fuel: { name: "Fuel Allowance", monthlyLimit: "5,000", billRequired: true, carryForward: false },
      phone_internet: { name: "Phone / Internet", monthlyLimit: "1,500", billRequired: true, carryForward: true },
      children_education: { name: "Children's Education", monthlyLimit: "3,000", billRequired: true, carryForward: true },
      health_fitness: { name: "Health & Fitness", monthlyLimit: "3,500", billRequired: true, carryForward: false },
      professional_development: { name: "Professional Development", monthlyLimit: "5,000", billRequired: true, carryForward: false },
      books_periodicals: { name: "Books & Periodicals", monthlyLimit: "1,500", billRequired: true, carryForward: false },
    }),
  },
  {
    id: "bracket-sr-mgr", name: "Senior Manager", expanded: false, globalMaxLimit: "₹4,50,000 / year",
    benefits: padBenefits({
      food: { name: "Food Allowance", monthlyLimit: "6,000", billRequired: false, carryForward: false },
      fuel: { name: "Fuel Allowance", monthlyLimit: "7,000", billRequired: true, carryForward: false },
      phone_internet: { name: "Phone / Internet", monthlyLimit: "2,000", billRequired: true, carryForward: true },
      children_education: { name: "Children's Education", monthlyLimit: "5,000", billRequired: true, carryForward: true },
      health_fitness: { name: "Health & Fitness", monthlyLimit: "5,000", billRequired: true, carryForward: false },
      professional_development: { name: "Professional Development", monthlyLimit: "8,000", billRequired: true, carryForward: false },
      business_travel: { name: "Business Travel", monthlyLimit: "10,000", billRequired: true, carryForward: true },
      books_periodicals: { name: "Books & Periodicals", monthlyLimit: "2,000", billRequired: true, carryForward: false },
    }),
  },
  {
    id: "bracket-avp", name: "Associate Vice President", expanded: false, globalMaxLimit: "₹7,80,000 / year",
    benefits: padBenefits({
      food: { name: "Food Allowance", monthlyLimit: "8,000", billRequired: false, carryForward: false },
      fuel: { name: "Fuel Allowance", monthlyLimit: "10,000", billRequired: true, carryForward: false },
      phone_internet: { name: "Phone / Internet", monthlyLimit: "2,500", billRequired: true, carryForward: true },
      children_education: { name: "Children's Education", monthlyLimit: "6,000", billRequired: true, carryForward: true },
      health_fitness: { name: "Health & Fitness", monthlyLimit: "6,000", billRequired: true, carryForward: false },
      professional_development: { name: "Professional Development", monthlyLimit: "12,000", billRequired: true, carryForward: false },
      business_travel: { name: "Business Travel", monthlyLimit: "15,000", billRequired: true, carryForward: true },
      books_periodicals: { name: "Books & Periodicals", monthlyLimit: "3,000", billRequired: true, carryForward: false },
      drivers_salary: { name: "Driver's Salary", monthlyLimit: "8,000", billRequired: true, carryForward: true },
    }),
  },
  {
    id: "bracket-vp", name: "Vice President", expanded: false, globalMaxLimit: "₹12,00,000 / year",
    benefits: padBenefits({
      food: { name: "Food Allowance", monthlyLimit: "10,000", billRequired: false, carryForward: false },
      fuel: { name: "Fuel Allowance", monthlyLimit: "15,000", billRequired: true, carryForward: false },
      phone_internet: { name: "Phone / Internet", monthlyLimit: "3,000", billRequired: true, carryForward: true },
      children_education: { name: "Children's Education", monthlyLimit: "8,000", billRequired: true, carryForward: true },
      health_fitness: { name: "Health & Fitness", monthlyLimit: "8,000", billRequired: true, carryForward: false },
      professional_development: { name: "Professional Development", monthlyLimit: "15,000", billRequired: true, carryForward: false },
      business_travel: { name: "Business Travel", monthlyLimit: "20,000", billRequired: true, carryForward: true },
      books_periodicals: { name: "Books & Periodicals", monthlyLimit: "5,000", billRequired: true, carryForward: false },
      drivers_salary: { name: "Driver's Salary", monthlyLimit: "12,000", billRequired: true, carryForward: true },
      vehicle_maintenance: { name: "Vehicle Maintenance", monthlyLimit: "8,000", billRequired: true, carryForward: true },
    }),
  },
];

// ─── Dashboard KPIs ──────────────────────────────────────────────────────────

export const DEMO_DASHBOARD = {
  kpis: {
    pendingApprovals: 12,
    approvedCount: 156,
    rejectedCount: 14,
    activeEmployees: 19,
    totalEmployees: 20,
  },
  planDistribution: {
    Associate: 4,
    "Senior Associate": 5,
    Manager: 4,
    "Senior Manager": 3,
    AVP: 2,
    VP: 2,
  },
  recentActivity: DEMO_CLAIMS
    .filter(c => c.status !== "pending")
    .slice(0, 5)
    .map(c => ({
      action: c.status === "approved" ? "Approved" : "Rejected",
      employee: c.employeeName,
      type: c.benefitType,
      amount: c.claimAmount,
      by: c.actionBy || "Admin",
      time: c.actionTimestamp || c.dateSubmitted,
      claimId: c.id,
      status: c.status,
      initials: c.initials,
      avatarColor: c.avatarColor,
      category: c.category,
    })),
};
