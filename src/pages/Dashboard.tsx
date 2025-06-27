
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MapPin, AlertCircle, ArrowRightLeft } from 'lucide-react';

interface DashboardStats {
  totalFarmers: number;
  totalVisits: number;
  totalIssues: number;
  totalTransfers: number;
  totalFieldOfficers: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalFarmers: 0,
    totalVisits: 0,
    totalIssues: 0,
    totalTransfers: 0,
    totalFieldOfficers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [farmersResult, visitsResult, issuesResult, transfersResult, officersResult] = await Promise.all([
          supabase.from('farmers').select('*', { count: 'exact', head: true }),
          supabase.from('farm_visits').select('*', { count: 'exact', head: true }),
          supabase.from('issues').select('*', { count: 'exact', head: true }),
          supabase.from('transfer_requests').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'field_officer'),
        ]);

        setStats({
          totalFarmers: farmersResult.count || 0,
          totalVisits: visitsResult.count || 0,
          totalIssues: issuesResult.count || 0,
          totalTransfers: transfersResult.count || 0,
          totalFieldOfficers: officersResult.count || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Farmers',
      value: stats.totalFarmers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Field Officers',
      value: stats.totalFieldOfficers,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Farm Visits',
      value: stats.totalVisits,
      icon: MapPin,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Open Issues',
      value: stats.totalIssues,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Transfer Requests',
      value: stats.totalTransfers,
      icon: ArrowRightLeft,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Dashboard Overview
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to your Farmetrics admin dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card) => (
          <Card key={card.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">No recent activity to display.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-col space-y-2">
              <button className="text-left text-sm text-blue-600 hover:text-blue-800">
                View Field Officers
              </button>
              <button className="text-left text-sm text-blue-600 hover:text-blue-800">
                Review Issues
              </button>
              <button className="text-left text-sm text-blue-600 hover:text-blue-800">
                Approve Transfers
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
