
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  MapPin, 
  AlertCircle, 
  ArrowRightLeft, 
  Camera,
  FileText,
  TrendingUp,
  Sync,
  Database,
  CheckCircle,
  Clock,
  Map
} from 'lucide-react';
import RecentActivityFeed from '@/components/RecentActivityFeed';
import WeeklyTrendsChart from '@/components/WeeklyTrendsChart';
import SyncStatusOverview from '@/components/SyncStatusOverview';
import GeographicOverview from '@/components/GeographicOverview';

interface DashboardMetrics {
  todaySubmissions: number;
  farmPolygonsMapped: number;
  monthlyMediaFiles: number;
  activeFieldOfficers: number;
  pendingReviews: number;
  reportsSubmitted: number;
  dataQualityScore: number;
  syncSuccessRate: number;
}

const Dashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    todaySubmissions: 0,
    farmPolygonsMapped: 0,
    monthlyMediaFiles: 0,
    activeFieldOfficers: 0,
    pendingReviews: 0,
    reportsSubmitted: 0,
    dataQualityScore: 0,
    syncSuccessRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const thisMonth = new Date().toISOString().substring(0, 7);

        // Get today's submissions
        const { count: todaySubmissions } = await supabase
          .from('farm_visits')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', `${today}T00:00:00.000Z`)
          .lt('created_at', `${today}T23:59:59.999Z`);

        // Get farm polygons mapped (visits with polygon data)
        const { count: farmPolygonsMapped } = await supabase
          .from('farm_visits')
          .select('*', { count: 'exact', head: true })
          .not('polygon_boundaries', 'is', null);

        // Get monthly media files
        const { count: monthlyMediaFiles } = await supabase
          .from('visit_media')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', `${thisMonth}-01T00:00:00.000Z`);

        // Get active field officers (officers who submitted data in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: activeOfficersData } = await supabase
          .from('farm_visits')
          .select('field_officer_id')
          .gte('created_at', sevenDaysAgo.toISOString());

        const activeFieldOfficers = new Set(activeOfficersData?.map(v => v.field_officer_id) || []).size;

        // Get pending reviews (open issues)
        const { count: pendingReviews } = await supabase
          .from('issues')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'open');

        // Get reports submitted (completed visits this month)
        const { count: reportsSubmitted } = await supabase
          .from('farm_visits')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed')
          .gte('created_at', `${thisMonth}-01T00:00:00.000Z`);

        // Calculate data quality score (visits with complete GPS data)
        const { count: totalVisits } = await supabase
          .from('farm_visits')
          .select('*', { count: 'exact', head: true });

        const { count: qualityVisits } = await supabase
          .from('farm_visits')
          .select('*', { count: 'exact', head: true })
          .not('gps_latitude', 'is', null)
          .not('gps_longitude', 'is', null);

        const dataQualityScore = totalVisits > 0 ? Math.round((qualityVisits / totalVisits) * 100) : 0;

        // Calculate sync success rate (completed vs total visits)
        const { count: completedVisits } = await supabase
          .from('farm_visits')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed');

        const syncSuccessRate = totalVisits > 0 ? Math.round((completedVisits / totalVisits) * 100) : 0;

        setMetrics({
          todaySubmissions: todaySubmissions || 0,
          farmPolygonsMapped: farmPolygonsMapped || 0,
          monthlyMediaFiles: monthlyMediaFiles || 0,
          activeFieldOfficers,
          pendingReviews: pendingReviews || 0,
          reportsSubmitted: reportsSubmitted || 0,
          dataQualityScore,
          syncSuccessRate,
        });
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const metricCards = [
    {
      title: 'Data Submissions Today',
      value: metrics.todaySubmissions,
      icon: Database,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Photos, videos, and polygons received',
    },
    {
      title: 'Farm Polygons Mapped',
      value: metrics.farmPolygonsMapped,
      icon: Map,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'GPS boundaries submitted',
    },
    {
      title: 'Media Files (Month)',
      value: metrics.monthlyMediaFiles,
      icon: Camera,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Photos and videos uploaded',
    },
    {
      title: 'Active Field Officers',
      value: metrics.activeFieldOfficers,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Currently submitting data',
    },
    {
      title: 'Pending Reviews',
      value: metrics.pendingReviews,
      icon: Clock,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Awaiting supervisor approval',
    },
    {
      title: 'Reports Submitted',
      value: metrics.reportsSubmitted,
      icon: FileText,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Completed this month',
    },
    {
      title: 'Data Quality Score',
      value: `${metrics.dataQualityScore}%`,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'GPS accuracy & completeness',
    },
    {
      title: 'Sync Success Rate',
      value: `${metrics.syncSuccessRate}%`,
      icon: Sync,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      description: 'Mobile app sync success',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
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
          Admin Dashboard
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Real-time monitoring and management of field operations
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => (
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
              <p className="text-xs text-gray-500 mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Analytics Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WeeklyTrendsChart />
        <SyncStatusOverview />
      </div>

      {/* Geographic and Activity Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GeographicOverview />
        <RecentActivityFeed />
      </div>
    </div>
  );
};

export default Dashboard;
