import { useEffect } from 'react';
import { Link } from 'react-router';
import { useOverviewStore } from '../store/overview';
import {
  User,
  FolderOpen,
  Lightning,
  Brain,
  Sparkle,
  WarningCircle,
  ArrowRight,
} from '@phosphor-icons/react';

function formatRelative(iso: string | null): string {
  if (!iso) return 'never';
  const t = new Date(iso).getTime();
  const diffMs = Date.now() - t;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}

function Section({
  icon: Icon,
  title,
  href,
  children,
  count,
}: {
  icon: React.ComponentType<{ size?: number; weight?: 'regular' | 'fill' }>;
  title: string;
  href?: string;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <section className="bg-muted rounded-lg border border-border">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 text-normal font-medium">
          <Icon size={16} />
          <span>{title}</span>
          {typeof count === 'number' && (
            <span className="text-low text-xs ml-1">({count})</span>
          )}
        </div>
        {href && (
          <Link
            to={href}
            className="text-low hover:text-brand text-xs flex items-center gap-1"
          >
            View all <ArrowRight size={12} />
          </Link>
        )}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

export default function OverviewPage() {
  const {
    profile,
    activeProjects,
    recentSessions,
    recentMemories,
    recentInsights,
    lastMemoryAt,
    lastSessionAt,
    totalMemories,
    totalSessions,
    staleProjectIds,
    isLoading,
    error,
    fetchOverview,
  } = useOverviewStore();

  useEffect(() => {
    void fetchOverview();
  }, [fetchOverview]);

  if (isLoading && !profile && activeProjects.length === 0) {
    return (
      <div className="p-6 text-low">Loading what agents know…</div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {error && (
        <div className="bg-error/10 border border-error/30 text-error rounded-lg p-3 text-sm flex items-center gap-2">
          <WarningCircle size={16} />
          <span>Could not load overview: {error}</span>
        </div>
      )}

      {/* Health bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <HealthStat label="Memories" value={totalMemories.toLocaleString()} sub={`last ${formatRelative(lastMemoryAt)}`} />
        <HealthStat label="Sessions" value={totalSessions.toLocaleString()} sub={`last ${formatRelative(lastSessionAt)}`} />
        <HealthStat label="Active projects" value={String(activeProjects.length)} sub={staleProjectIds.length > 0 ? `${staleProjectIds.length} stale` : 'all fresh'} warn={staleProjectIds.length > 0} />
        <HealthStat label="Insights" value={String(recentInsights.length)} sub="recent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <Section icon={User} title="Profile">
          {profile ? (
            <dl className="space-y-2 text-sm">
              <Field label="Name" value={profile.name} />
              <Field label="Pronouns" value={profile.pronouns} />
              <Field label="Location" value={profile.location} />
              <Field label="Timezone" value={profile.timezone} />
              <Field label="Communication style" value={profile.communication_style} />
              {profile.context && (
                <div>
                  <dt className="text-low text-xs uppercase tracking-wide mt-3">Context</dt>
                  <dd className="text-normal whitespace-pre-wrap mt-1">{profile.context}</dd>
                </div>
              )}
            </dl>
          ) : (
            <Empty text="No profile row found in Firmament" />
          )}
        </Section>

        {/* Active projects */}
        <Section
          icon={FolderOpen}
          title="Active projects"
          href="/projects"
          count={activeProjects.length}
        >
          {activeProjects.length === 0 ? (
            <Empty text="No active projects" />
          ) : (
            <ul className="space-y-2">
              {activeProjects.slice(0, 8).map((p) => {
                const isStale = staleProjectIds.includes(p.id);
                return (
                  <li key={p.id} className="flex items-start justify-between text-sm gap-3">
                    <div className="min-w-0">
                      <div className="text-normal font-medium truncate flex items-center gap-2">
                        {p.name}
                        {isStale && (
                          <span title="Not updated in 60+ days" className="text-warning">
                            <WarningCircle size={12} weight="fill" />
                          </span>
                        )}
                      </div>
                      {p.local_path && (
                        <div className="text-low text-xs truncate font-mono">{p.local_path}</div>
                      )}
                    </div>
                    <div className="text-low text-xs whitespace-nowrap">
                      {p.status} · {formatRelative(p.updated_at)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        {/* Recent sessions */}
        <Section
          icon={Lightning}
          title="Recent sessions"
          href="/sessions"
          count={recentSessions.length}
        >
          {recentSessions.length === 0 ? (
            <Empty text="No sessions yet" />
          ) : (
            <ul className="space-y-3">
              {recentSessions.map((s) => (
                <li key={s.id} className="text-sm">
                  <div className="flex items-center gap-2 text-xs text-low mb-1">
                    <span className="px-1.5 py-0.5 bg-elevated rounded">{s.interface}</span>
                    {s.machine && <span>{s.machine}</span>}
                    <span>· {formatRelative(s.started_at)}</span>
                  </div>
                  <div className="text-normal line-clamp-2">
                    {s.summary || <span className="text-low italic">no summary</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Recent memories */}
        <Section
          icon={Brain}
          title="Recent memories"
          href="/memories"
          count={recentMemories.length}
        >
          {recentMemories.length === 0 ? (
            <Empty text="No memories yet" />
          ) : (
            <ul className="space-y-3">
              {recentMemories.map((m) => (
                <li key={m.id} className="text-sm">
                  <div className="flex items-center gap-2 text-xs text-low mb-1">
                    <span className="px-1.5 py-0.5 bg-elevated rounded">{m.category}</span>
                    {m.confidence && (
                      <span className="text-low">conf: {m.confidence}</span>
                    )}
                    <span>· {formatRelative(m.created_at)}</span>
                  </div>
                  <div className="text-normal line-clamp-3">{m.content}</div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Derived insights */}
        <Section
          icon={Sparkle}
          title="Recent insights"
          href="/insights"
          count={recentInsights.length}
        >
          {recentInsights.length === 0 ? (
            <Empty text="No insights yet" />
          ) : (
            <ul className="space-y-3">
              {recentInsights.map((i) => (
                <li key={i.id} className="text-sm">
                  <div className="flex items-center gap-2 text-xs text-low mb-1">
                    <span className="px-1.5 py-0.5 bg-elevated rounded">{i.insight_type}</span>
                    {i.confidence && (
                      <span className="text-low">conf: {i.confidence}</span>
                    )}
                    <span>· {formatRelative(i.created_at)}</span>
                  </div>
                  <div className="text-normal line-clamp-3">{i.content}</div>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}

function HealthStat({
  label,
  value,
  sub,
  warn,
}: {
  label: string;
  value: string;
  sub?: string;
  warn?: boolean;
}) {
  return (
    <div className="bg-muted border border-border rounded-lg p-4">
      <div className="text-low text-xs uppercase tracking-wide">{label}</div>
      <div className="text-normal text-2xl font-medium mt-1">{value}</div>
      {sub && (
        <div className={`text-xs mt-1 ${warn ? 'text-warning' : 'text-low'}`}>{sub}</div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-low text-xs uppercase tracking-wide">{label}</dt>
      <dd className="text-normal text-right">{value}</dd>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="text-low text-sm italic">{text}</div>;
}
