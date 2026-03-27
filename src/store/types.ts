export interface Plan {
  id: string;
  title: string;
  customTitle: boolean;
  markdown: string;
  filePath: string | null;
  isDirty: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  plans: Plan[];
  activeId: string | null;

  createPlan: (initialMarkdown?: string) => string;
  closePlan: (id: string) => void;
  setActivePlan: (id: string) => void;
  updatePlanContent: (id: string, markdown: string) => void;
  updatePlanTitle: (id: string, title: string) => void;
  markSaved: (id: string, filePath: string) => void;
  reorderPlans: (fromIndex: number, toIndex: number) => void;
}
