import { usePlanStore } from '../../store/planStore';
import { TabItem } from './TabItem';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const { plans, activeId, createPlan, setActivePlan, closePlan, updatePlanTitle } = usePlanStore();

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>Plans</h2>
        <button
          className={styles.newBtn}
          onClick={() => createPlan()}
          title="New plan (Cmd+N)"
        >
          +
        </button>
      </div>
      <div className={styles.tabList}>
        {plans.length === 0 ? (
          <p className={styles.empty}>
            No plans yet.<br />
            Click + to create one or paste a Claude Code plan.
          </p>
        ) : (
          plans.map((plan) => (
            <TabItem
              key={plan.id}
              plan={plan}
              isActive={plan.id === activeId}
              onSelect={() => setActivePlan(plan.id)}
              onClose={() => closePlan(plan.id)}
              onRename={(title) => updatePlanTitle(plan.id, title)}
            />
          ))
        )}
      </div>
    </div>
  );
}
