import { createBrowserRouter } from "react-router";
import { lazy } from "react";
import { Layout } from "./components/Layout";
import { NotFound } from "./components/NotFound";

const Dashboard         = lazy(() => import("./components/Dashboard").then(m => ({ default: m.Dashboard })));
const PolicyEngine      = lazy(() => import("./components/PolicyEngine").then(m => ({ default: m.PolicyEngine })));
const ApprovalQueue     = lazy(() => import("./components/ApprovalQueue").then(m => ({ default: m.ApprovalQueue })));
const Analytics         = lazy(() => import("./components/Analytics").then(m => ({ default: m.Analytics })));
const EmployeeDirectory = lazy(() => import("./components/EmployeeDirectory").then(m => ({ default: m.EmployeeDirectory })));
const Settings          = lazy(() => import("./components/Settings").then(m => ({ default: m.Settings })));
const PayrollExport     = lazy(() => import("./components/payroll/PayrollExport").then(m => ({ default: m.PayrollExport })));
const OnboardingWizard  = lazy(() => import("./components/onboarding/OnboardingWizard").then(m => ({ default: m.OnboardingWizard })));
const FiscalSettings    = lazy(() => import("./components/fiscal/FiscalSettings").then(m => ({ default: m.FiscalSettings })));
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
      { path: "analytics", Component: Analytics },
      { path: "employees", Component: EmployeeDirectory },
      { path: "settings", Component: Settings },
      { path: "onboarding", Component: OnboardingWizard },
      { path: "fiscal", Component: FiscalSettings },
      { path: "help", Component: HelpCenter },
      { path: "*", Component: NotFound },
    ],
  },
]);
