-- Index for active_subscription on tools table.
-- The active_subscription column is used as a filter predicate in multiple
-- computed selectors (totalMonthlyCost, totalAnnualCost, renewingWithin30Days).
-- A partial index keeps the index small and targets the common query pattern
-- of filtering for tools with an active subscription.

create index if not exists idx_tools_active_subscription
  on tools (billing_cycle)
  where active_subscription = true;
