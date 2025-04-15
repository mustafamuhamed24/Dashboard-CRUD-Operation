
import { useState, useEffect } from "react";
import AppShell from "@/components/layouts/AppShell";
import CasesList from "@/components/cases/CasesList";
import { mockCases, getCaseById } from "@/data/mockCases";
import { Case } from "@/types/case";

const CasesPage = () => {
  const [cases, setCases] = useState<Case[]>([]);
  
  useEffect(() => {
    // Load cases from localStorage or use mock data
    const savedCases = localStorage.getItem('caseGuardianCases');
    if (savedCases) {
      setCases(JSON.parse(savedCases));
    } else {
      setCases(mockCases);
      localStorage.setItem('caseGuardianCases', JSON.stringify(mockCases));
    }
  }, []);

  // This effect syncs between tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'caseGuardianCases') {
        setCases(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AppShell>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Cases Management</h1>
        <p className="text-muted-foreground">
          View and manage all your security cases.
        </p>
        <CasesList cases={cases} />
      </div>
    </AppShell>
  );
};

export default CasesPage;
