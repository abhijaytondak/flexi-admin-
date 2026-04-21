/**
 * Demo data for client presentation.
 * Realistic Indian employee names, departments, benefit claims, and policy brackets.
 * Used as fallback when API returns empty or setupRequired.
 */

import type { Employee, Claim, SalaryBand, Cycle, Dispute, RiskLevel, BillStatus, AutoApproveRule } from "../types";
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

  // High-value claims requiring manual approval (above ₹70,000)
  { id: "CLM-1021", employeeName: "Rahul Khanna", employeeId: "EMP-015", initials: "RK", avatarColor: COLORS[14], department: "Product", benefitType: "Business Travel Allowance", category: "Travel", claimAmount: "₹95,400", dateSubmitted: randomDate(2), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "International conference - SFO return flight", merchantName: "Emirates", transactionId: "UPI-91827364", salaryBand: "₹25L+", approvalTag: "manual" },
  { id: "CLM-1022", employeeName: "Vikram Reddy", employeeId: "EMP-005", initials: "VR", avatarColor: COLORS[4], department: "Sales", benefitType: "Professional Development Allowance", category: "Education", claimAmount: "₹1,20,000", dateSubmitted: randomDate(4), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Executive MBA short program fees", merchantName: "ISB Hyderabad", transactionId: "UPI-55647382", salaryBand: "₹18L – ₹25L", approvalTag: "escalated" },
  { id: "CLM-1023", employeeName: "Divya Rao", employeeId: "EMP-020", initials: "DR", avatarColor: COLORS[4], department: "Operations", benefitType: "Driver's Salary", category: "Other", claimAmount: "₹78,500", dateSubmitted: randomDate(3), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Quarterly driver salary reimbursement", merchantName: "Direct Payment", transactionId: "UPI-73625481", salaryBand: "₹18L – ₹25L", approvalTag: "manual" },
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

// ─── Cycles (PRD v0) ─────────────────────────────────────────────────────────

export const DEMO_CYCLES: Cycle[] = [
  {
    id: "cyc-2026-02",
    month: "February",
    year: 2026,
    label: "February 2026",
    submissionCutoff: "2026-02-25",
    payrollCutoff: "2026-02-28",
    status: "closed",
  },
  {
    id: "cyc-2026-03",
    month: "March",
    year: 2026,
    label: "March 2026",
    submissionCutoff: "2026-03-25",
    payrollCutoff: "2026-03-28",
    status: "closed",
  },
  {
    id: "cyc-2026-04",
    month: "April",
    year: 2026,
    label: "April 2026",
    submissionCutoff: "2026-04-25",
    payrollCutoff: "2026-04-28",
    status: "active",
  },
];

export const CURRENT_CYCLE_ID = "cyc-2026-04";

// ─── Claim augmentation (PRD v0) ─────────────────────────────────────────────
//
// Mutates DEMO_CLAIMS in-place with additive fields:
//  - cycleId (~75% on active)
//  - riskLevel distribution (~80% normal / 15% medium / 5% high)
//  - flaggedByAI + flagReason on high + some medium
//  - billStatus, approvalSource, autoApproveRule on auto-approved,
//    multiMonthAllocation on 2-3 claims
// ---------------------------------------------------------------------------

const RISK_DISTRIBUTION: RiskLevel[] = [
  // 80% normal, 15% medium, 5% high over 20 slots
  "normal","normal","normal","normal","normal","normal","normal","normal","normal","normal",
  "normal","normal","normal","normal","normal","normal",
  "medium","medium","medium",
  "high",
];

const BILL_STATUSES: BillStatus[] = ["validated", "uploaded", "pending", "mismatch", "not_required"];

const FLAG_REASONS = [
  "Merchant not in pre-approved list",
  "Amount exceeds category median by 3.2x",
  "Possible duplicate of last cycle submission",
  "Receipt text mismatch with declared merchant",
  "Pattern deviates from employee's baseline",
];

// Apply augmentation deterministically by index so every demo run is consistent.
DEMO_CLAIMS.forEach((c, i) => {
  // ~75% of claims belong to the active cycle; the rest go to the most recent closed cycle.
  c.cycleId = i % 4 === 0 ? "cyc-2026-03" : CURRENT_CYCLE_ID;

  const risk = RISK_DISTRIBUTION[i % RISK_DISTRIBUTION.length];
  c.riskLevel = risk;

  // AI flag: all highs are flagged; about 1/3 of mediums are flagged
  if (risk === "high" || (risk === "medium" && i % 3 === 0)) {
    c.flaggedByAI = true;
    c.flagReason = FLAG_REASONS[i % FLAG_REASONS.length];
  } else {
    c.flaggedByAI = false;
  }

  // Bill status by category: food rarely needs bill, others do
  if (c.category === "Food") {
    c.billStatus = i % 2 === 0 ? "not_required" : "validated";
  } else {
    c.billStatus = BILL_STATUSES[i % BILL_STATUSES.length];
  }

  if (c.status === "approved") {
    c.approvalSource = i % 3 === 0 ? "auto" : "manual";
    // If auto, attach a rule — exercise all 3 types across the dataset
    if (c.approvalSource === "auto") {
      c.status = "auto_approved";
      const ruleKind = i % 3;
      if (ruleKind === 0) {
        c.autoApproveRule = { type: "category", category: "food" };
      } else if (ruleKind === 1) {
        c.autoApproveRule = { type: "threshold", amountLessThan: 2500 };
      } else {
        c.autoApproveRule = { type: "employee", employeeId: c.employeeId || "EMP-001" };
      }
    }
  }
});

// Ensure we exercise each AutoApproveRule discriminated-union variant at least once:
const ruleSeeds: { id: string; rule: AutoApproveRule }[] = [
  { id: "CLM-1009", rule: { type: "category", category: "fuel" } },
  { id: "CLM-1010", rule: { type: "threshold", amountLessThan: 2500 } },
  { id: "CLM-1011", rule: { type: "employee", employeeId: "EMP-011" } },
];
ruleSeeds.forEach(({ id, rule }) => {
  const claim = DEMO_CLAIMS.find((c) => c.id === id);
  if (claim) {
    claim.status = "auto_approved";
    claim.approvalSource = "auto";
    claim.autoApproveRule = rule;
    claim.cycleId = CURRENT_CYCLE_ID;
    claim.flaggedByAI = false;
    claim.riskLevel = "normal";
  }
});

// Seed multi-month allocation on multiple claims so HR can see the
// per-month breakdown for several real cases (annual subscriptions,
// quarterly memberships, executive courses, etc.).
const allocSeeds = [
  // Sneha's Cult.fit annual membership: ₹13,500 paid up front, split into
  // 3 monthly slices of ₹4,500 (Apr, May, Jun). Currently in slice 1 (Apr).
  // Each slice meets-or-exceeds the ₹4,000 Health & Fitness monthly cap.
  {
    id: "CLM-1004",
    originalTransactionId: "UPI-ORIG-12938475",
    originalDate: "2026-04-01",
    originalMerchant: "Cult.fit",
    originalAmount: 13500,
    allocationAmount: 4500,
    index: 1,
    total: 3,
  },
  // Vikram's Executive MBA — 2 huge slices of ₹1,20,000 each.
  {
    id: "CLM-1022",
    originalTransactionId: "UPI-ORIG-55647382",
    originalDate: "2026-03-15",
    originalMerchant: "ISB Hyderabad",
    originalAmount: 240000,
    allocationAmount: 120000,
    index: 2,
    total: 2,
  },
  // Rahul's international conference flight — split into 2 slices.
  {
    id: "CLM-1021",
    originalTransactionId: "UPI-ORIG-91827364",
    originalDate: "2026-03-22",
    originalMerchant: "Emirates",
    originalAmount: 190800,
    allocationAmount: 95400,
    index: 1,
    total: 2,
  },
  // Deepika's Udemy AWS Certification — ₹25,500 over 3 months.
  {
    id: "CLM-1007",
    originalTransactionId: "UPI-ORIG-74829103",
    originalDate: "2026-04-05",
    originalMerchant: "Udemy",
    originalAmount: 25500,
    allocationAmount: 8500,
    index: 1,
    total: 3,
  },
];
allocSeeds.forEach((s) => {
  const claim = DEMO_CLAIMS.find((c) => c.id === s.id);
  if (claim) {
    claim.multiMonthAllocation = {
      index: s.index,
      total: s.total,
      originalTransactionId: s.originalTransactionId,
      originalDate: s.originalDate,
      originalMerchant: s.originalMerchant,
      originalAmount: s.originalAmount,
      allocationAmount: s.allocationAmount,
    };
    claim.cycleId = CURRENT_CYCLE_ID;
  }
});

// Rejection reasons on already-rejected claims
const rejSeeds: { id: string; reason: Claim["rejectionReason"]; note?: string }[] = [
  { id: "CLM-1014", reason: "not_a_business_expense" },
  { id: "CLM-1015", reason: "policy_violation" },
];
rejSeeds.forEach(({ id, reason, note }) => {
  const claim = DEMO_CLAIMS.find((c) => c.id === id);
  if (claim) {
    claim.rejectionReason = reason;
    if (note) claim.rejectionNote = note;
  }
});

// ─── Disputes (PRD v0) ───────────────────────────────────────────────────────

export const DEMO_DISPUTES: Dispute[] = [
  {
    id: "DSP-2001",
    employeeId: "EMP-001",
    employeeName: "Raj Patel",
    initials: "RP",
    avatarColor: COLORS[0],
    claimId: "CLM-1001",
    claimCategory: "Fuel",
    originalTransaction: { date: "2026-04-12", merchant: "Indian Oil Corp", amount: 3200 },
    disputeType: "wrong_category",
    status: "raised",
    raisedAt: "2026-04-14T09:12:00Z",
  },
  {
    id: "DSP-2002",
    employeeId: "EMP-004",
    employeeName: "Sneha Gupta",
    initials: "SG",
    avatarColor: COLORS[3],
    claimId: "CLM-1004",
    claimCategory: "Health",
    originalTransaction: { date: "2026-04-10", merchant: "Cult.fit", amount: 4500 },
    disputeType: "wrong_rejection",
    status: "under_review",
    raisedAt: "2026-04-13T14:30:00Z",
  },
  {
    id: "DSP-2003",
    employeeId: "EMP-007",
    employeeName: "Karthik Iyer",
    initials: "KI",
    avatarColor: COLORS[6],
    claimId: "CLM-1008",
    claimCategory: "Food",
    originalTransaction: { date: "2026-04-09", merchant: "Zomato", amount: 2000 },
    disputeType: "missed_transaction",
    status: "under_review",
    raisedAt: "2026-04-12T11:05:00Z",
  },
  {
    id: "DSP-2004",
    employeeId: "EMP-009",
    employeeName: "Rohit Dalal",
    initials: "RD",
    avatarColor: COLORS[8],
    claimId: "CLM-1010",
    claimCategory: "Food",
    originalTransaction: { date: "2026-03-18", merchant: "Sodexo", amount: 2200 },
    disputeType: "wrong_category",
    status: "resolved",
    resolutionDetails: {
      action: "Category updated from Food to Business Meals",
      by: "Ops (Priya N.)",
      at: "2026-03-22T10:00:00Z",
    },
    raisedAt: "2026-03-20T16:40:00Z",
  },
  {
    id: "DSP-2005",
    employeeId: "EMP-013",
    employeeName: "Sanjay Mehta",
    initials: "SM",
    avatarColor: COLORS[12],
    claimId: "CLM-1014",
    claimCategory: "Travel",
    originalTransaction: { date: "2026-03-10", merchant: "MakeMyTrip", amount: 18500 },
    disputeType: "wrong_rejection",
    status: "rejected",
    resolutionDetails: {
      action: "Dispute reviewed; original rejection upheld",
      by: "Ops (Arvind S.)",
      at: "2026-03-14T13:20:00Z",
    },
    raisedAt: "2026-03-12T09:00:00Z",
  },
  {
    id: "DSP-2006",
    employeeId: "EMP-015",
    employeeName: "Rahul Khanna",
    initials: "RK",
    avatarColor: COLORS[14],
    claimId: "CLM-1020",
    claimCategory: "Travel",
    originalTransaction: { date: "2026-04-08", merchant: "Air India", amount: 15200 },
    disputeType: "other",
    status: "raised",
    raisedAt: "2026-04-15T08:20:00Z",
  },
  {
    id: "DSP-2007",
    employeeId: "EMP-010",
    employeeName: "Deepika Nair",
    initials: "DN",
    avatarColor: COLORS[9],
    claimId: "CLM-1007",
    claimCategory: "Education",
    originalTransaction: { date: "2026-04-05", merchant: "Udemy", amount: 8500 },
    disputeType: "missed_transaction",
    status: "resolved",
    resolutionDetails: {
      action: "Missed transaction added to cycle",
      by: "Ops (Neha V.)",
      at: "2026-04-11T17:15:00Z",
    },
    raisedAt: "2026-04-09T12:00:00Z",
  },
  {
    id: "DSP-2008",
    employeeId: "EMP-020",
    employeeName: "Divya Rao",
    initials: "DR",
    avatarColor: COLORS[4],
    claimId: "CLM-1016",
    claimCategory: "Fuel",
    originalTransaction: { date: "2026-04-14", merchant: "BPCL", amount: 4100 },
    disputeType: "wrong_category",
    status: "under_review",
    raisedAt: "2026-04-16T10:45:00Z",
  },
  {
    id: "DSP-2009",
    employeeId: "EMP-019",
    employeeName: "Aditya Bhatt",
    initials: "AB",
    avatarColor: COLORS[3],
    claimId: "CLM-1015",
    claimCategory: "Other",
    originalTransaction: { date: "2026-03-24", merchant: "Amazon India", amount: 5000 },
    disputeType: "other",
    status: "rejected",
    resolutionDetails: {
      action: "Insufficient documentation — original decision maintained",
      by: "Ops (Arvind S.)",
      at: "2026-03-28T09:10:00Z",
    },
    raisedAt: "2026-03-26T15:30:00Z",
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
