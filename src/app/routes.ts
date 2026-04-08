import { createBrowserRouter } from "react-router";
import { lazy } from "react";
import { Layout } from "./components/Layout";
import { NotFound } from "./components/NotFound";

const Dashboard         = lazy(() => import("./components/Dashboard").then(m => ({ default: m.Dashboard })));
const PolicyEngine      = lazy(() => import("./components/PolicyEngine").then(m => ({ default: m.PolicyEngine })));
const ApprovalQueue     = lazy(() => import("./components/ApprovalQueue").then(m => ({ default: m.ApprovalQueue })));
const EmployeeDirectory = lazy(() => import("./components/EmployeeDirectory").then(m => ({ default: m.EmployeeDirectory })));
const PayrollExport     = lazy(() => import("./components/payroll/PayrollExport").then(m => ({ default: m.PayrollExport })));
const OnboardingWizard  = lazy(() => import("./components/onboarding/OnboardingWizard").then(m => ({ default: m.OnboardingWizard })));
const HelpCenter        = lazy(() => import("./components/HelpCenter").then(m => ({ default: m.HelpCenter })));

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "policy", Component: PolicyEngine },
      { path: "approvals", Component: ApprovalQueue },
      { path: "payroll", Component: PayrollExport },
      { path: "employees", Component: EmployeeDirectory },
      { path: "onboarding", Component: OnboardingWizard },
      { path: "help", Component: HelpCenter },
      { path: "*", Component: NotFound },
    ],
  },
]);
