import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    RadialBarChart, RadialBar, ComposedChart
} from 'recharts';
import { Users, LayoutDashboard, ShoppingBag, TrendingUp, Sparkles, Clock, Star, ArrowUpRight, ArrowDownRight, Zap, Target, Cpu } from 'lucide-react';

const WEEKLY_DATA = [
  { name: 'Mon', current: 120, previous: 90 }, { name: 'Tue', current: 180, previous: 140 },
  { name: 'Wed', current: 290, previous: 210 }, { name: 'Thu', current: 450, previous: 380 },
  { name: 'Fri', current: 720, previous: 600 }, { name: 'Sat', current: 1450, previous: 1100 },
  { name: 'Sun', current: 2310, previous: 1800 },
];

const MONTHLY_DATA = [
  { name: 'W1', current: 4500, previous: 3800 }, { name: 'W2', current: 5800, previous: 4900 },
  { name: 'W3', current: 8200, previous: 7100 }, { name: 'W4', current: 12450, previous: 9800 },
];

const RADAR_DATA = [
  { subject: 'Fabric Accuracy', A: 120, fullMark: 150 },
  { subject: 'Drape Physics', A: 98, fullMark: 150 },
  { subject: 'Face-Swap UI', A: 86, fullMark: 150 },
  { subject: 'Speed', A: 99, fullMark: 150 },
  { subject: 'Occasion Recs', A: 85, fullMark: 150 },
];

const STATUS_DATA = [
  { name: 'Server Load', value: 75, fill: '#8b5cf6' },
  { name: 'GPU Latency', value: 45, fill: '#10b981' },
  { name: 'Cache Hit', value: 92, fill: '#3b82f6' },
];

const SPARK_DATA = [
    { v: 10 }, { v: 15 }, { v: 12 }, { v: 25 }, { v: 18 }, { v: 30 }, { v: 22 }
];

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

const StatCard = ({ title, value, icon, trend, data, color }) => {
    const isPositive = trend.startsWith('+');
    return (
        <div className="glass-card flex flex-col p-5 transition hover:border-primary-color border-white/10 border relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">{title}</span>
                    <span className="text-2xl font-black text-white mt-1">{value}</span>
                </div>
                <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    <span className="font-bold">{trend}</span>
                </div>
            </div>
            
            <div className="h-[60px] w-full mt-auto relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data || SPARK_DATA}>
                        <Area type="monotone" dataKey="v" stroke={color || 'var(--primary-color)'} fillOpacity={0.2} fill={color || 'var(--primary-color)'} strokeWidth={2} isAnimationActive={true} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition">
                {icon}
            </div>
        </div>
    );
};

const AdminDashboard = () => {
  const [timeframe, setTimeframe] = useState('week');
  const activeData = timeframe === 'week' ? WEEKLY_DATA : MONTHLY_DATA;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
      
      {/* Header Visualized */}
      <div className="flex justify-between items-center mb-10 pt-4">
        <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary-color/10 border border-primary-color/20 flex items-center justify-center">
                <LayoutDashboard className="text-primary-color" size={32} />
            </div>
            <div>
                <h1 className="m-0 text-3xl font-black gradient-text">Command Center</h1>
                <div className="flex items-center gap-3 mt-1 opacity-60">
                    <div className="flex items-center gap-1.5 text-xs"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> SYSTEM STABLE</div>
                    <div className="w-1 h-1 rounded-full bg-white/20"></div>
                    <div className="text-xs font-bold uppercase tracking-widest">Global Analytics v2.0</div>
                </div>
            </div>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button className={`px-6 py-2 rounded-lg text-[10px] font-black tracking-widest transition cursor-pointer border-none ${timeframe === 'week' ? 'bg-primary-color text-white' : 'text-muted bg-transparent hover:text-white'}`} onClick={() => setTimeframe('week')}>WEEK</button>
            <button className={`px-6 py-2 rounded-lg text-[10px] font-black tracking-widest transition cursor-pointer border-none ${timeframe === 'month' ? 'bg-primary-color text-white' : 'text-muted bg-transparent hover:text-white'}`} onClick={() => setTimeframe('month')}>MONTH</button>
        </div>
      </div>

      {/* Graphical Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-10">
          <StatCard title="Platform Traffic" value="48.2k" trend="+14%" color="#8b5cf6" icon={<TrendingUp size={64}/>} data={[{v:10}, {v:25}, {v:20}, {v:45}, {v:30}, {v:60}, {v:55}]} />
          <StatCard title="Conversion Rate" value="3.4%" trend="+2.1%" color="#3b82f6" icon={<Target size={64}/>} data={[{v:20}, {v:22}, {v:18}, {v:25}, {v:28}, {v:32}, {v:34}]} />
          <StatCard title="GPU Latency" value="0.9s" trend="-0.4s" color="#10b981" icon={<Zap size={64}/>} data={[{v:50}, {v:45}, {v:40}, {v:42}, {v:35}, {v:30}, {v:28}]} />
          <StatCard title="Average Rating" value="4.8" trend="+0.1" color="#f59e0b" icon={<Star size={64}/>} data={[{v:4.5}, {v:4.6}, {v:4.6}, {v:4.7}, {v:4.8}, {v:4.8}, {v:4.8}]} />
      </div>

      <div className="grid grid-cols-12 gap-6">
          {/* Growth Area Chart (Primary) */}
          <div className="glass-card col-span-8 p-8 flex flex-col h-[450px]">
              <div className="flex justify-between items-center mb-8">
                  <h3 className="m-0 text-white text-lg font-black uppercase tracking-tight flex items-center gap-2">
                    <Sparkles className="text-primary-color" size={20}/> Growth Trajectory
                  </h3>
                  <div className="flex items-center gap-6 opacity-40">
                      <div className="flex items-center gap-2 text-[10px]"><div className="w-2 h-2 rounded-full bg-primary-color"></div> CURRENT</div>
                      <div className="flex items-center gap-2 text-[10px]"><div className="w-2 h-2 rounded bg-white/20"></div> PREVIOUS</div>
                  </div>
              </div>
              <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={activeData}>
                          <defs>
                              <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                          <XAxis dataKey="name" stroke="none" tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10}} />
                          <YAxis stroke="none" tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10}} />
                          <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #222', borderRadius: '8px' }} />
                          <Area type="monotone" dataKey="previous" stroke="rgba(255,255,255,0.1)" fill="rgba(255,255,255,0.02)" strokeWidth={2} strokeDasharray="4 4" />
                          <Area type="monotone" dataKey="current" stroke="#8b5cf6" fill="url(#glow)" strokeWidth={4} animationDuration={2000} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Radar Sentiment Chart */}
          <div className="glass-card col-span-4 p-8 flex flex-col h-[450px]">
              <h3 className="m-0 text-white text-sm font-black uppercase tracking-widest opacity-80 mb-6">User Sentiment Axis</h3>
              <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_DATA}>
                          <PolarGrid stroke="rgba(255,255,255,0.05)" />
                          <PolarAngleAxis dataKey="subject" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 10}} />
                          <Radar name="Platform Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                          <Tooltip contentStyle={{ background: '#000', border: 'none' }} />
                      </RadarChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mt-6">
          {/* Horizontal Conversion Chart */}
          <div className="glass-card col-span-6 p-8 flex flex-col h-[320px]">
              <h3 className="m-0 text-white text-sm font-black uppercase tracking-widest opacity-80 mb-6">Performance Leaderboard</h3>
              <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                          { name: 'Velvet', value: 85 }, { name: 'Banarasi', value: 72 }, 
                          { name: 'Kanjivaram', value: 64 }, { name: 'Organza', value: 58 }
                      ]} layout="vertical">
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={100} tick={{fill: 'rgba(255,255,255,0.8)', fontSize: 11}} stroke="none" />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                              {[0,1,2,3].map(i => <Cell key={i} fill={COLORS[i]} />)}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Radial Server Status */}
          <div className="glass-card col-span-6 p-8 flex flex-col h-[320px]">
                <h3 className="m-0 text-white text-sm font-black uppercase tracking-widest opacity-80 mb-6">Pipeline Health</h3>
                <div className="flex-1 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="100%" barSize={15} data={STATUS_DATA}>
                            <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#fff', fontSize: 10 }} background clockwise={true} dataKey="value" />
                            <Legend iconSize={10} width={120} height={140} layout="vertical" verticalAlign="middle" align="right" />
                            <Tooltip contentStyle={{ background: '#000', border: 'none' }} />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center">
                        <Cpu size={32} className="text-primary-color opacity-20"/>
                    </div>
                </div>
          </div>
      </div>

      <div className="mt-10 mb-20 p-8 glass-card border-primary-color/20 bg-primary-color/5 flex items-center justify-between">
          <div className="flex gap-10">
              <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Global Load</span>
                  <span className="text-2xl font-black text-white">LOW</span>
              </div>
              <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Active Inst.</span>
                  <span className="text-2xl font-black text-white">4</span>
              </div>
              <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Success Rate</span>
                  <span className="text-2xl font-black text-green-400">99.2%</span>
              </div>
          </div>
          <NavLink to="/admin" className="btn btn-primary px-10 py-3">Enter Data Center</NavLink>
      </div>
    </div>
  );
};

export default AdminDashboard;
