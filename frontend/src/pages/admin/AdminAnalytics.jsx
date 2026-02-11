import { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/components/AdminLayout';
import { analyticsAPI } from '@/lib/api';
import axios from 'axios';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

export default function AdminAnalytics() {
  const [overview, setOverview] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [revenueChart, setRevenueChart] = useState([]);
  const [orderStatus, setOrderStatus] = useState({});
  const [profitStats, setProfitStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartDays, setChartDays] = useState(30);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, topRes, chartRes, statusRes] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getTopProducts(10),
        analyticsAPI.getRevenueChart(chartDays),
        analyticsAPI.getOrderStatus(),
      ]);
      setOverview(overviewRes.data);
      setTopProducts(topRes.data);
      setRevenueChart(chartRes.data);
      setOrderStatus(statusRes.data);
      
      // Fetch profit analytics
      const token = localStorage.getItem('admin_token');
      if (token) {
        const profitRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/profit`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfitStats(profitRes.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [chartDays]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatCurrency = (amount) => {
    const rounded = Math.round(amount || 0);
    if (rounded >= 100000) return `Rs ${(rounded / 100000).toFixed(1)}L`;
    if (rounded >= 1000) return `Rs ${(rounded / 1000).toFixed(1)}K`;
    return `Rs ${rounded.toLocaleString()}`;
  };

  const statusPieData = Object.entries(orderStatus).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count
  }));

  if (loading && !overview) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <select
            value={chartDays}
            onChange={(e) => setChartDays(Number(e.target.value))}
            className="bg-zinc-800 border-zinc-700 text-white rounded-md px-3 py-2"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {/* Overview Stats - Only Today, Week, Month */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Today's Revenue"
            value={formatCurrency(overview?.today?.revenue || 0)}
            subtitle={`${overview?.today?.orders || 0} orders`}
            icon={DollarSign}
            trend={overview?.today?.revenue > 0 ? 'up' : 'neutral'}
          />
          <StatCard
            title="This Week"
            value={formatCurrency(overview?.week?.revenue || 0)}
            subtitle={`${overview?.week?.orders || 0} orders`}
            icon={TrendingUp}
            trend="up"
          />
          <StatCard
            title="This Month"
            value={formatCurrency(overview?.month?.revenue || 0)}
            subtitle={`${overview?.month?.orders || 0} orders`}
            icon={BarChart3}
            trend="up"
          />
        </div>

        {/* Profit Analytics - Only Today, Week, Month */}
        {profitStats && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" /> Profit Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Today', data: profitStats.today },
                  { label: 'This Week', data: profitStats.week },
                  { label: 'This Month', data: profitStats.month }
                ].map((period) => (
                  <div key={period.label} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                    <p className="text-gray-400 text-sm mb-3 font-medium">{period.label}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Revenue:</span>
                        <span className="text-white font-medium">Rs {Math.round(period.data?.revenue || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Cost:</span>
                        <span className="text-red-400 font-medium">Rs {Math.round(period.data?.cost || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold border-t border-zinc-600 pt-2 mt-2">
                        <span className="text-gray-400">Profit:</span>
                        <span className={period.data?.profit >= 0 ? "text-green-400" : "text-red-400"}>
                          Rs {Math.round(period.data?.profit || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-xs mt-4">* Profit = Revenue - Cost Price (set in product variations)</p>
            </CardContent>
          </Card>
        )}

        {/* Website Visits Analytics */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" /> Website Visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                <p className="text-gray-400 text-sm mb-2">Today</p>
                <p className="text-2xl font-bold text-white">{overview?.visits?.today || 0}</p>
                <p className="text-gray-500 text-xs mt-1">unique visitors</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                <p className="text-gray-400 text-sm mb-2">This Week</p>
                <p className="text-2xl font-bold text-white">{overview?.visits?.week || 0}</p>
                <p className="text-gray-500 text-xs mt-1">unique visitors</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                <p className="text-gray-400 text-sm mb-2">This Month</p>
                <p className="text-2xl font-bold text-white">{overview?.visits?.month || 0}</p>
                <p className="text-gray-500 text-xs mt-1">unique visitors</p>
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-4">* Website visit tracking is based on unique page views</p>
          </CardContent>
        </Card>

        {/* Revenue Chart - Full Width */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChart}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F5A623" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F5A623" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#666"
                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#666" tickFormatter={(val) => `Rs ${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f1f1f', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value) => [`Rs ${value}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#F5A623" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No sales data yet</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="text-amber-500 font-bold w-6">#{idx + 1}</span>
                    <div className="flex-1">
                      <p className="text-white font-medium">{product.name}</p>
                      <p className="text-gray-400 text-sm">{product.quantity} sold</p>
                    </div>
                    <span className="text-green-400 font-semibold">
                      Rs {Math.round(product.revenue || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, trend }) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-lg ${trend === 'up' ? 'bg-green-500/10' : trend === 'down' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
            <Icon className={`w-6 h-6 ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-amber-500'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
