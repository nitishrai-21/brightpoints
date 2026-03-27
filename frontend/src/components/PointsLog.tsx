//src/components/PointsLog.tsx
function groupByDate(logs: any[]) {
  const groups: Record<string, any[]> = {};

  logs.forEach((log) => {
    const rawDate = log.awarded_at || log.created_at || log.date;
    const date = new Date(rawDate).toDateString();

    if (!groups[date]) groups[date] = [];
    groups[date].push(log);
  });

  return groups;
}

export default function PointsLog({ logs = [] }: any) {
  const grouped = groupByDate(logs);

  return (
    <div className="points-log">
      {Object.entries(grouped).map(([date, items]: any) => (
        <div key={date} className="log-group">
          <div className="group-date">
            {new Date(date)
              .toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
              .toUpperCase()}
          </div>

          {items.map((log: any) => {
            const houseName = log.house_name;

            return (
              <div key={log.id} className="log-item">
                <div>
                  <div className="log-title">
                    {log.points} to {houseName}
                  </div>
                  <div className="log-sub">
                    {log.teacher_name} • {log.reason}
                  </div>
                </div>

                {/* 3 DOT MENU */}
                <div className="log-menu">•••</div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
