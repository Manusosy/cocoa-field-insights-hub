
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  officer_name: string;
  officer_initials: string;
  region: string;
  submission_type: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'in_progress';
}

const RecentActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const { data: visits, error } = await supabase
          .from('farm_visits')
          .select(`
            id,
            created_at,
            status,
            visit_notes,
            profiles!farm_visits_field_officer_id_fkey (
              full_name,
              region
            )
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        const formattedActivities: ActivityItem[] = visits?.map(visit => ({
          id: visit.id,
          officer_name: visit.profiles?.full_name || 'Unknown Officer',
          officer_initials: visit.profiles?.full_name
            ?.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase() || 'UO',
          region: visit.profiles?.region || 'Unknown Region',
          submission_type: visit.visit_notes ? 'Farm Report' : 'Farm Visit',
          timestamp: visit.created_at,
          status: visit.status as 'completed' | 'pending' | 'in_progress',
        })) || [];

        setActivities(formattedActivities);
      } catch (error) {
        console.error('Error fetching recent activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivities();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Approved';
      case 'pending':
        return 'Pending Review';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Field Data Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Field Data Submissions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No recent submissions found
            </p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                    {activity.officer_initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.officer_name}
                    </p>
                    <Badge variant="secondary" className={getStatusColor(activity.status)}>
                      {getStatusText(activity.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="truncate">{activity.region}</span>
                    <span className="mx-2">•</span>
                    <span>{activity.submission_type}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivityFeed;
