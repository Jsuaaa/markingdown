import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { AppState, Plan } from './types';
import { extractTitle } from '../utils/markdownHelpers';

const createNewPlan = (markdown = ''): Plan => ({
  id: nanoid(),
  title: extractTitle(markdown) || 'Untitled Plan',
  customTitle: false,
  markdown,
  filePath: null,
  isDirty: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const usePlanStore = create<AppState>()(
  persist(
    (set, get) => ({
      plans: [],
      activeId: null,

      createPlan: (initialMarkdown?: string) => {
        const plan = createNewPlan(initialMarkdown);
        set((state) => ({
          plans: [...state.plans, plan],
          activeId: plan.id,
        }));
        return plan.id;
      },

      closePlan: (id: string) => {
        const { plans, activeId } = get();
        const index = plans.findIndex((p) => p.id === id);
        if (index === -1) return;

        const newPlans = plans.filter((p) => p.id !== id);
        let newActiveId = activeId;

        if (activeId === id) {
          if (newPlans.length === 0) {
            newActiveId = null;
          } else if (index >= newPlans.length) {
            newActiveId = newPlans[newPlans.length - 1].id;
          } else {
            newActiveId = newPlans[index].id;
          }
        }

        set({ plans: newPlans, activeId: newActiveId });
      },

      setActivePlan: (id: string) => {
        set({ activeId: id });
      },

      updatePlanContent: (id: string, markdown: string) => {
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === id
              ? {
                  ...p,
                  markdown,
                  title: p.customTitle ? p.title : (extractTitle(markdown) || 'Untitled Plan'),
                  isDirty: true,
                  updatedAt: Date.now(),
                }
              : p
          ),
        }));
      },

      updatePlanTitle: (id: string, title: string) => {
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === id ? { ...p, title, customTitle: true, updatedAt: Date.now() } : p
          ),
        }));
      },

      markSaved: (id: string, filePath: string) => {
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === id ? { ...p, filePath, isDirty: false, updatedAt: Date.now() } : p
          ),
        }));
      },

      reorderPlans: (fromIndex: number, toIndex: number) => {
        set((state) => {
          const newPlans = [...state.plans];
          const [moved] = newPlans.splice(fromIndex, 1);
          newPlans.splice(toIndex, 0, moved);
          return { plans: newPlans };
        });
      },
    }),
    {
      name: 'markingdown-plans',
      partialize: (state) => ({
        plans: state.plans,
        activeId: state.activeId,
      }),
    }
  )
);
