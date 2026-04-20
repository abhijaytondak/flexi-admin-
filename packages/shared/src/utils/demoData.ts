/**
 * Demo data for client presentation.
 * Realistic Indian employee names, departments, benefit claims, and policy brackets.
 * Used as fallback when API returns empty or setupRequired.
 */

import type { Employee, Claim, SalaryBand, Cycle, Dispute } from "../types";
import { FLEXI_BENEFIT_CATEGORIES } from "../types";

// ─── Cycles (monthly submission / payroll windows) ───────────────────────────

export const DEMO_CYCLES: Cycle[] = [
  {
    id: "CYC-2026-02",
    month: 2,
    year: 2026,
    label: "February 2026",
    submissionCutoff: "2026-02-25T18:30:00.000Z",
    payrollCutoff: "2026-02-28T18:30:00.000Z",
    status: "closed",
  },
  {
    id: "CYC-2026-03",
    month: 3,
    year: 2026,
    label: "March 2026",
    submissionCutoff: "2026-03-25T18:30:00.000Z",
    payrollCutoff: "2026-03-31T18:30:00.000Z",
    status: "closed",
  },
  {
    id: "CYC-2026-04",
    month: 4,
    year: 2026,
    label: "April 2026",
    submissionCutoff: "2026-04-25T18:30:00.000Z",
    payrollCutoff: "2026-04-30T18:30:00.000Z",
    status: "active",
  },
];

export const CURRENT_CYCLE_ID = "CYC-2026-04";

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
  { id: "CLM-1001", employeeName: "Raj Patel", employeeId: "EMP-001", initials: "RP", avatarColor: COLORS[0], department: "Engineering", benefitType: "Fuel Allowance", category: "Fuel", claimAmount: "₹3,200", dateSubmitted: randomDate(3), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Petrol bill - Indian Oil, Andheri", merchantName: "Indian Oil Corp", transactionId: "UPI-78392014", salaryBand: "₹5L – ₹8L", approvalTag: "manual", cycleId: CURRENT_CYCLE_ID, riskLevel: "normal", billStatus: "validated" },
  { id: "CLM-1002", employeeName: "Priya Sharma", employeeId: "EMP-002", initials: "PS", avatarColor: COLORS[1], department: "Human Resources", benefitType: "Food Allowance", category: "Food", claimAmount: "₹2,500", dateSubmitted: randomDate(2), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Swiggy monthly food subscription", merchantName: "Swiggy", transactionId: "UPI-48291037", salaryBand: "₹2.5L – ₹5L", approvalTag: "auto", cycleId: CURRENT_CYCLE_ID, riskLevel: "normal", billStatus: "not_required" },
  { id: "CLM-1003", employeeName: "Arjun Singh", employeeId: "EMP-003", initials: "AS", avatarColor: COLORS[2], department: "Engineering", benefitType: "Phone/Internet Allowance", category: "Phone/Internet", claimAmount: "₹1,499", dateSubmitted: randomDate(1), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Airtel fiber monthly bill", merchantName: "Airtel", transactionId: "UPI-92817364", salaryBand: "₹12L – ₹18L", approvalTag: "auto", cycleId: CURRENT_CYCLE_ID, riskLevel: "normal", billStatus: "validated" },
  { id: "CLM-1004", employeeName: "Sneha Gupta", employeeId: "EMP-004", initials: "SG", avatarColor: COLORS[3], department: "Product", benefitType: "Health and Fitness Allowance", category: "Health", claimAmount: "₹4,500", dateSubmitted: randomDate(4), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Cult.fit quarterly membership", merchantName: "Cult.fit", transactionId: "UPI-12938475", salaryBand: "₹8L – ₹12L", approvalTag: "manual", cycleId: CURRENT_CYCLE_ID, riskLevel: "medium", flaggedByAI: true, flagReason: "Quarterly subscription — verify not already reimbursed in prior cycle", billStatus: "uploaded" },
  { id: "CLM-1005", employeeName: "Vikram Reddy", employeeId: "EMP-005", initials: "VR", avatarColor: COLORS[4], department: "Sales", benefitType: "Business Travel Allowance", category: "Travel", claimAmount: "₹12,800", dateSubmitted: randomDate(5), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Client visit - Mumbai to Delhi flight", merchantName: "IndiGo Airlines", transactionId: "UPI-56473829", salaryBand: "₹18L – ₹25L", approvalTag: "escalated", cycleId: CURRENT_CYCLE_ID, riskLevel: "medium", flaggedByAI: false, billStatus: "validated" },
  { id: "CLM-1006", employeeName: "Meera Joshi", employeeId: "EMP-008", initials: "MJ", avatarColor: COLORS[7], department: "Marketing", benefitType: "Books and Periodicals", category: "Education", claimAmount: "₹1,200", dateSubmitted: randomDate(2), status: "pending", upiScreenshot: undefined, receiptDescription: "Marketing textbook - Amazon", merchantName: "Amazon India", transactionId: "UPI-38291047", salaryBand: "₹5L – ₹8L", approvalTag: "auto", cycleId: CURRENT_CYCLE_ID, riskLevel: "medium", flaggedByAI: true, flagReason: "Bill not uploaded — category requires proof of purchase", billStatus: "pending" },
  { id: "CLM-1007", employeeName: "Deepika Nair", employeeId: "EMP-010", initials: "DN", avatarColor: COLORS[9], department: "Engineering", benefitType: "Professional Development Allowance", category: "Education", claimAmount: "₹8,500", dateSubmitted: randomDate(6), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "AWS Certification course (3-month access)", merchantName: "Udemy", transactionId: "UPI-74829103", salaryBand: "₹5L – ₹8L", approvalTag: "escalated", cycleId: CURRENT_CYCLE_ID, riskLevel: "normal", billStatus: "validated", multiMonthAllocation: { index: 1, total: 3, originalTransactionId: "UPI-74829103", originalDate: randomDate(6), originalMerchant: "Udemy", originalAmount: 25500, allocationAmount: 8500 } },
  { id: "CLM-1008", employeeName: "Karthik Iyer", employeeId: "EMP-007", initials: "KI", avatarColor: COLORS[6], department: "Engineering", benefitType: "Food Allowance", category: "Food", claimAmount: "₹2,000", dateSubmitted: randomDate(1), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Zomato monthly meals", merchantName: "Zomato", transactionId: "UPI-29384756", salaryBand: "₹2.5L – ₹5L", approvalTag: "auto", cycleId: CURRENT_CYCLE_ID, riskLevel: "normal", billStatus: "not_required" },

  // Approved claims
  { id: "CLM-1009", employeeName: "Anita Desai", employeeId: "EMP-006", initials: "AD", avatarColor: COLORS[5], department: "Finance", benefitType: "Fuel Allowance", category: "Fuel", claimAmount: "₹2,800", dateSubmitted: randomDate(10), status: "approved", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "HP Petrol pump - Worli", actionNote: "Verified fuel receipts. Approved.", actionTimestamp: randomDate(8), actionBy: "Amanda Johnson", merchantName: "HP Petroleum", transactionId: "UPI-83746291", salaryBand: "₹8L – ₹12L", approvalTag: "auto", cycleId: "CYC-2026-03", riskLevel: "normal", billStatus: "validated", approvalSource: "auto", autoApproveRule: { type: "category", category: "fuel" } },
  { id: "CLM-1010", employeeName: "Rohit Dalal", employeeId: "EMP-009", initials: "RD", avatarColor: COLORS[8], department: "Operations", benefitType: "Food Allowance", category: "Food", claimAmount: "₹2,200", dateSubmitted: randomDate(12), status: "approved", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Office lunch meals", actionNote: "Regular food allowance claim. Approved.", actionTimestamp: randomDate(9), actionBy: "Amanda Johnson", merchantName: "Sodexo", transactionId: "UPI-19283746", salaryBand: "₹5L – ₹8L", approvalTag: "auto", cycleId: "CYC-2026-03", riskLevel: "normal", billStatus: "not_required", approvalSource: "auto", autoApproveRule: { type: "threshold", amountLessThan: 5000 } },
  { id: "CLM-1011", employeeName: "Amit Verma", employeeId: "EMP-011", initials: "AV", avatarColor: COLORS[10], department: "Engineering", benefitType: "Phone/Internet Allowance", category: "Phone/Internet", claimAmount: "₹999", dateSubmitted: randomDate(15), status: "approved", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Jio fiber plan", actionNote: "Internet bill verified.", actionTimestamp: randomDate(12), actionBy: "Amanda Johnson", merchantName: "Jio", transactionId: "UPI-47382910", salaryBand: "₹8L – ₹12L", approvalTag: "auto", cycleId: "CYC-2026-02", riskLevel: "normal", billStatus: "validated", approvalSource: "auto", autoApproveRule: { type: "employee", employeeId: "EMP-011" } },
  { id: "CLM-1012", employeeName: "Nisha Kapoor", employeeId: "EMP-014", initials: "NK", avatarColor: COLORS[13], department: "Design", benefitType: "Health and Fitness Allowance", category: "Health", claimAmount: "₹3,000", dateSubmitted: randomDate(14), status: "approved", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Gym membership - Gold's Gym", actionNote: "Quarterly gym membership approved.", actionTimestamp: randomDate(11), actionBy: "Amanda Johnson", merchantName: "Gold's Gym", transactionId: "UPI-65748392", salaryBand: "₹5L – ₹8L", approvalTag: "manual", cycleId: "CYC-2026-03", riskLevel: "normal", billStatus: "validated", approvalSource: "manual" },
  { id: "CLM-1013", employeeName: "Lakshmi Pillai", employeeId: "EMP-012", initials: "LP", avatarColor: COLORS[11], department: "Legal", benefitType: "Books and Periodicals", category: "Education", claimAmount: "₹2,400", dateSubmitted: randomDate(18), status: "approved", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Legal journals subscription", actionNote: "Professional development. Approved.", actionTimestamp: randomDate(15), actionBy: "Amanda Johnson", merchantName: "LexisNexis", transactionId: "UPI-92837461", salaryBand: "₹12L – ₹18L", approvalTag: "auto", cycleId: "CYC-2026-02", riskLevel: "normal", billStatus: "validated", approvalSource: "auto", autoApproveRule: { type: "category", category: "books_periodicals" } },

  // Rejected claims
  { id: "CLM-1014", employeeName: "Sanjay Mehta", employeeId: "EMP-013", initials: "SM", avatarColor: COLORS[12], department: "Sales", benefitType: "Business Travel Allowance", category: "Travel", claimAmount: "₹18,500", dateSubmitted: randomDate(20), status: "rejected", upiScreenshot: undefined, receiptDescription: "Team outing - Goa trip", actionNote: "Personal trip, not business travel. No supporting documents provided. [Amount returned to employee limit]", actionTimestamp: randomDate(17), actionBy: "Amanda Johnson", merchantName: "MakeMyTrip", transactionId: "UPI-38192746", salaryBand: "₹2.5L – ₹5L", approvalTag: "escalated", cycleId: "CYC-2026-02", riskLevel: "high", flaggedByAI: true, flagReason: "Merchant indicates leisure travel; no client itinerary attached", billStatus: "mismatch", rejectionReason: "not_a_business_expense", rejectionNote: "Goa trip is personal — no client meeting linked." },
  { id: "CLM-1015", employeeName: "Aditya Bhatt", employeeId: "EMP-019", initials: "AB", avatarColor: COLORS[3], department: "Marketing", benefitType: "Gift Allowance", category: "Other", claimAmount: "₹5,000", dateSubmitted: randomDate(22), status: "rejected", upiScreenshot: undefined, receiptDescription: "Personal shopping - Amazon", actionNote: "Exceeds gift allowance limit. No valid business justification. [Amount returned to employee limit]", actionTimestamp: randomDate(19), actionBy: "Amanda Johnson", merchantName: "Amazon India", transactionId: "UPI-74619283", salaryBand: "₹2.5L – ₹5L", approvalTag: "manual", cycleId: "CYC-2026-02", riskLevel: "medium", flaggedByAI: true, flagReason: "Exceeds gift allowance cap", billStatus: "pending", rejectionReason: "policy_violation", rejectionNote: "Amount exceeds allowed gift limit of ₹2,000." },

  // More pending for bulk demo
  { id: "CLM-1016", employeeName: "Divya Rao", employeeId: "EMP-020", initials: "DR", avatarColor: COLORS[4], department: "Operations", benefitType: "Fuel Allowance", category: "Fuel", claimAmount: "₹4,100", dateSubmitted: randomDate(1), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "BPCL petrol - 3 fill-ups", merchantName: "BPCL", transactionId: "UPI-84729301", salaryBand: "₹18L – ₹25L", approvalTag: "manual", cycleId: CURRENT_CYCLE_ID, riskLevel: "normal", billStatus: "validated" },
  { id: "CLM-1017", employeeName: "Pooja Rajan", employeeId: "EMP-016", initials: "PR", avatarColor: COLORS[0], department: "Human Resources", benefitType: "Food Allowance", category: "Food", claimAmount: "₹1,800", dateSubmitted: randomDate(2), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Canteen meals - March", merchantName: "Office Canteen", transactionId: "UPI-19384756", salaryBand: "₹2.5L – ₹5L", approvalTag: "auto", cycleId: CURRENT_CYCLE_ID, riskLevel: "normal", billStatus: "not_required" },
  { id: "CLM-1018", employeeName: "Suresh Kumar", employeeId: "EMP-017", initials: "SK", avatarColor: COLORS[1], department: "Finance", benefitType: "Phone/Internet Allowance", category: "Phone/Internet", claimAmount: "₹799", dateSubmitted: randomDate(3), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Vi prepaid recharge", merchantName: "Vi (Vodafone Idea)", transactionId: "UPI-47382019", salaryBand: "₹5L – ₹8L", approvalTag: "auto", cycleId: CURRENT_CYCLE_ID, riskLevel: "normal", billStatus: "validated" },
  { id: "CLM-1019", employeeName: "Kavitha Menon", employeeId: "EMP-018", initials: "KM", avatarColor: COLORS[2], department: "Engineering", benefitType: "Children's Education Allowance", category: "Education", claimAmount: "₹6,500", dateSubmitted: randomDate(4), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "School tuition fees - Ryan International (term 1 of 3)", merchantName: "Ryan International School", transactionId: "UPI-65472839", salaryBand: "₹8L – ₹12L", approvalTag: "manual", cycleId: CURRENT_CYCLE_ID, riskLevel: "normal", billStatus: "validated", multiMonthAllocation: { index: 2, total: 3, originalTransactionId: "UPI-65472839", originalDate: randomDate(35), originalMerchant: "Ryan International School", originalAmount: 19500, allocationAmount: 6500 } },
  { id: "CLM-1020", employeeName: "Rahul Khanna", employeeId: "EMP-015", initials: "RK", avatarColor: COLORS[14], department: "Product", benefitType: "Business Travel Allowance", category: "Travel", claimAmount: "₹15,200", dateSubmitted: randomDate(2), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Product conference - BLR to HYD", merchantName: "Air India", transactionId: "UPI-28374910", salaryBand: "₹25L+", approvalTag: "escalated", cycleId: CURRENT_CYCLE_ID, riskLevel: "medium", flaggedByAI: true, flagReason: "Conference within same company — verify event dates", billStatus: "uploaded" },

  // High-value claims requiring manual approval (above ₹70,000)
  { id: "CLM-1021", employeeName: "Rahul Khanna", employeeId: "EMP-015", initials: "RK", avatarColor: COLORS[14], department: "Product", benefitType: "Business Travel Allowance", category: "Travel", claimAmount: "₹95,400", dateSubmitted: randomDate(2), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "International conference - SFO return flight", merchantName: "Emirates", transactionId: "UPI-91827364", salaryBand: "₹25L+", approvalTag: "manual", cycleId: CURRENT_CYCLE_ID, riskLevel: "high", flaggedByAI: true, flagReason: "High-value international travel — requires CFO co-sign per policy", billStatus: "validated" },
  { id: "CLM-1022", employeeName: "Vikram Reddy", employeeId: "EMP-005", initials: "VR", avatarColor: COLORS[4], department: "Sales", benefitType: "Professional Development Allowance", category: "Education", claimAmount: "₹1,20,000", dateSubmitted: randomDate(4), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Executive MBA short program fees (3-month installment plan)", merchantName: "ISB Hyderabad", transactionId: "UPI-55647382", salaryBand: "₹18L – ₹25L", approvalTag: "escalated", cycleId: CURRENT_CYCLE_ID, riskLevel: "high", flaggedByAI: true, flagReason: "Unusually large claim — exceeds typical professional development spend", billStatus: "uploaded", multiMonthAllocation: { index: 1, total: 3, originalTransactionId: "UPI-55647382", originalDate: randomDate(4), originalMerchant: "ISB Hyderabad", originalAmount: 360000, allocationAmount: 120000 } },
  { id: "CLM-1023", employeeName: "Divya Rao", employeeId: "EMP-020", initials: "DR", avatarColor: COLORS[4], department: "Operations", benefitType: "Driver's Salary", category: "Other", claimAmount: "₹78,500", dateSubmitted: randomDate(3), status: "pending", upiScreenshot: "/upi-receipts/receipt.png", receiptDescription: "Quarterly driver salary reimbursement", merchantName: "Direct Payment", transactionId: "UPI-73625481", salaryBand: "₹18L – ₹25L", approvalTag: "manual", cycleId: CURRENT_CYCLE_ID, riskLevel: "medium", flaggedByAI: false, billStatus: "uploaded" },
];

// ─── Disputes (raised by employees against claim decisions) ──────────────────

export const DEMO_DISPUTES: Dispute[] = [
  {
    id: "DSP-2001",
    employeeId: "EMP-013",
    employeeName: "Sanjay Mehta",
    initials: "SM",
    avatarColor: COLORS[12],
    claimId: "CLM-1014",
    claimCategory: "Business Travel Allowance",
    originalTransaction: { date: randomDate(21), merchant: "MakeMyTrip", amount: 18500 },
    disputeType: "wrong_rejection",
    status: "under_review",
    raisedAt: randomDate(16),
  },
  {
    id: "DSP-2002",
    employeeId: "EMP-019",
    employeeName: "Aditya Bhatt",
    initials: "AB",
    avatarColor: COLORS[3],
    claimId: "CLM-1015",
    claimCategory: "Gift Allowance",
    originalTransaction: { date: randomDate(23), merchant: "Amazon India", amount: 5000 },
    disputeType: "wrong_rejection",
    status: "rejected",
    resolutionDetails: {
      action: "Rejection upheld — amount exceeds cap",
      by: "Amanda Johnson",
      at: randomDate(14),
    },
    raisedAt: randomDate(18),
  },
  {
    id: "DSP-2003",
    employeeId: "EMP-004",
    employeeName: "Sneha Gupta",
    initials: "SG",
    avatarColor: COLORS[3],
    claimId: "CLM-1004",
    claimCategory: "Health and Fitness Allowance",
    originalTransaction: { date: randomDate(5), merchant: "Cult.fit", amount: 4500 },
    disputeType: "wrong_category",
    status: "raised",
    raisedAt: randomDate(2),
  },
  {
    id: "DSP-2004",
    employeeId: "EMP-001",
    employeeName: "Raj Patel",
    initials: "RP",
    avatarColor: COLORS[0],
    claimId: "CLM-1001",
    claimCategory: "Fuel Allowance",
    originalTransaction: { date: randomDate(4), merchant: "Indian Oil Corp", amount: 3200 },
    disputeType: "missed_transaction",
    status: "resolved",
    resolutionDetails: {
      action: "Transaction added back to April cycle",
      by: "Amanda Johnson",
      at: randomDate(1),
    },
    raisedAt: randomDate(3),
  },
  {
    id: "DSP-2005",
    employeeId: "EMP-008",
    employeeName: "Meera Joshi",
    initials: "MJ",
    avatarColor: COLORS[7],
    claimId: "CLM-1006",
    claimCategory: "Books and Periodicals",
    originalTransaction: { date: randomDate(6), merchant: "Amazon India", amount: 1200 },
    disputeType: "wrong_category",
    status: "under_review",
    raisedAt: randomDate(1),
  },
  {
    id: "DSP-2006",
    employeeId: "EMP-010",
    employeeName: "Deepika Nair",
    initials: "DN",
    avatarColor: COLORS[9],
    claimId: "CLM-1007",
    claimCategory: "Professional Development Allowance",
    originalTransaction: { date: randomDate(8), merchant: "Udemy", amount: 25500 },
    disputeType: "other",
    status: "raised",
    raisedAt: randomDate(2),
  },
  {
    id: "DSP-2007",
    employeeId: "EMP-006",
    employeeName: "Anita Desai",
    initials: "AD",
    avatarColor: COLORS[5],
    claimId: "CLM-1009",
    claimCategory: "Fuel Allowance",
    originalTransaction: { date: randomDate(12), merchant: "HP Petroleum", amount: 2800 },
    disputeType: "missed_transaction",
    status: "resolved",
    resolutionDetails: {
      action: "Second receipt merged into existing approved claim",
      by: "Amanda Johnson",
      at: randomDate(7),
    },
    raisedAt: randomDate(10),
  },
  {
    id: "DSP-2008",
    employeeId: "EMP-015",
    employeeName: "Rahul Khanna",
    initials: "RK",
    avatarColor: COLORS[14],
    claimId: "CLM-1020",
    claimCategory: "Business Travel Allowance",
    originalTransaction: { date: randomDate(3), merchant: "Air India", amount: 15200 },
    disputeType: "other",
    status: "under_review",
    raisedAt: randomDate(1),
  },
  {
    id: "DSP-2009",
    employeeId: "EMP-011",
    employeeName: "Amit Verma",
    initials: "AV",
    avatarColor: COLORS[10],
    claimId: "CLM-1011",
    claimCategory: "Phone/Internet Allowance",
    originalTransaction: { date: randomDate(17), merchant: "Jio", amount: 999 },
    disputeType: "wrong_category",
    status: "resolved",
    resolutionDetails: {
      action: "Re-categorised as Phone/Internet (was Fuel)",
      by: "Amanda Johnson",
      at: randomDate(9),
    },
    raisedAt: randomDate(14),
  },
  {
    id: "DSP-2010",
    employeeId: "EMP-002",
    employeeName: "Priya Sharma",
    initials: "PS",
    avatarColor: COLORS[1],
    claimId: "CLM-1002",
    claimCategory: "Food Allowance",
    originalTransaction: { date: randomDate(3), merchant: "Swiggy", amount: 2500 },
    disputeType: "missed_transaction",
    status: "raised",
    raisedAt: randomDate(1),
  },
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
