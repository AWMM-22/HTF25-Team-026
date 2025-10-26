import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const lineData = [
  { name: "Jan", uv: 400 },
  { name: "Feb", uv: 300 },
  { name: "Mar", uv: 500 },
  { name: "Apr", uv: 450 },
  { name: "May", uv: 600 },
  { name: "Jun", uv: 520 },
];

const barData = [
  { name: "Mon", issues: 12 },
  { name: "Tue", issues: 9 },
  { name: "Wed", issues: 14 },
  { name: "Thu", issues: 8 },
  { name: "Fri", issues: 18 },
];

const pieData = [
  { name: "Resolved", value: 65 },
  { name: "Open", value: 25 },
  { name: "In Progress", value: 10 },
];

const COLORS = ["#60a5fa", "#a78bfa", "#f97316"];

const ShowcaseSection = () => {
  return (
    <section id="showcase" className="py-24 px-6 md:px-12 lg:px-24 bg-transparent">
      <div className="max-w-7xl mx-auto">
        {/* Moving window wrapper */}
        <div
          className="overflow-hidden rounded-3xl shadow-2xl"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.4))",
          }}
        >
          <div className="w-full relative">
            {/* Large dark app mock */}
            <div className="mx-auto my-8 p-6 md:p-8 bg-neutral-900/70 rounded-2xl border border-white/6 shadow-[0_20px_60px_rgba(2,6,23,0.6)] max-w-[1200px]">
              <div className="flex gap-6">
                {/* left sidebar */}
                <div className="w-20 flex flex-col items-center text-sm text-muted-foreground">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#ffb86b] to-[#a06cff] rounded-xl mb-4" />
                  <div className="w-12 h-40 bg-neutral-800 rounded-xl" />
                </div>

                {/* center kanban area (horizontally scrollable to simulate moving window) */}
                <div className="flex-1 overflow-hidden">
                  <div className="min-w-[1000px] animate-slide-left">
                    <div className="grid grid-cols-3 gap-4">
                      {[0, 1, 2].map((col) => (
                        <div key={col} className="p-4 bg-neutral-800/60 rounded-lg border border-white/5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-medium text-white/90">{col === 0 ? "Backlog" : col === 1 ? "To Do" : "In Progress"}</div>
                            <div className="text-xs text-white/60">{col === 0 ? "10" : col === 1 ? "24" : "3"}</div>
                          </div>

                          {[0, 1, 2].map((card) => (
                            <div key={card} className="mb-3 p-3 bg-neutral-900/60 rounded-md border border-white/4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="text-sm font-semibold text-white mb-2">Task {col + 1}-{card + 1}</div>
                                  <div className="text-xs text-white/60 mb-2">{card === 0 ? "Set up cluster monitoring" : card === 1 ? "Sales planning" : "User onboarding"}</div>
                                  <div className="h-2 bg-white/8 rounded w-3/4 mb-2" />
                                </div>
                                <div className="w-24 h-12">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={lineData}>
                                      <Line type="monotone" dataKey="uv" stroke="#60a5fa" strokeWidth={2} dot={false} />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* right inbox panel */}
                <div className="w-80 bg-neutral-900/50 rounded-xl p-4 border border-white/6">
                  <div className="text-sm font-semibold text-white/90 mb-4">Activity Feed</div>
                  <div className="space-y-3 h-[280px] overflow-y-auto pr-2">
                    {[
                      { name: "Pothole Reported", desc: "MG Road, Sector 12", color: "from-[#a855f7] to-[#c084fc]" },
                      { name: "Waste Cleared", desc: "Park Area, Zone 3", color: "from-[#e879f9] to-[#a855f7]" },
                      { name: "Street Light Fixed", desc: "Main Street, Block A", color: "from-[#c084fc] to-[#8b5cf6]" },
                      { name: "Drain Cleaned", desc: "Canal Road, Ward 5", color: "from-[#a855f7] to-[#e879f9]" },
                      { name: "New Complaint", desc: "Garbage Pile, Colony 7", color: "from-[#8b5cf6] to-[#a855f7]" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${item.color}`} />
                        <div className="flex-1">
                          <div className="text-xs text-white/90">{item.name}</div>
                          <div className="text-[11px] text-white/60">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* small graphs box below */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-gradient-to-b from-neutral-900/60 to-neutral-900/40 border border-white/5">
            <div className="text-sm text-white/90 mb-3">Monthly Reports</div>
            <div style={{ width: "100%", height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff11" />
                  <XAxis dataKey="name" tick={{ fill: "#ffffff88", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#ffffff88", fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="uv" stroke="#a78bfa" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-b from-neutral-900/60 to-neutral-900/40 border border-white/5">
            <div className="text-sm text-white/90 mb-3">Daily Issues</div>
            <div style={{ width: "100%", height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff11" />
                  <XAxis dataKey="name" tick={{ fill: "#ffffff88", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#ffffff88", fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="issues" fill="#60a5fa" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-b from-neutral-900/60 to-neutral-900/40 border border-white/5">
            <div className="text-sm text-white/90 mb-3">Status Breakdown</div>
            <div style={{ width: "100%", height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={36} outerRadius={60} paddingAngle={4}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
