
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Sync } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SyncStatus {
  officer_id: string;
  officer_name: string;
  status: 'success' | 'pending' | 'error';
  last_sync: string;
  total_submissions: number;
}

const SyncStatusOverview = () => {
  const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSyncStatuses = async () => {
      try {
        // Get all field officers and their recent activity
        const { data: officers, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'field_officer')
          .eq('is_active', true);

        if (error) throw error;

        const syncStatuses: SyncStatus[] = [];

        for (const officer of officers || []) {
          // Get officer's most recent visit
          const { data: recentVisit } = await supabase
            .from('farm_visits')
            .select('created_at, status')
            .eq('field_officer_id', officer.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get total submissions count
          const { count: totalSubmissions } = await supabase
            .from('farm_visits')
            .select('*', { count: 'exact', head: true })
            .eq('field_officer_id', officer.id);

          // Determine sync status based on recent activity and visit status
          let status: 'success' | 'pending' | 'error' = 'success';
          
          if (!recentVisit) {
            status = 'pending';
          } else if (recentVisit.status === 'in_progress') {
            status = 'pending';
          } else if (recentVisit.status === 'completed') {
            status = 'success';
          }

          // Check if last activity was more than 24 hours ago
          if (recentVisit) {
            const lastActivity = new Date(recentVisit.created_at);
            const hoursSinceLastActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60);
            if (hoursSinceLastActivity > 24) {
              status = 'error';
            }
          }

          syncStatuses.push({
            officer_id: officer.id,
            officer_name: officer.full_name,
            status,
            last_sync: recentVisit?.created_at || new Date().toISOString(),
            total_submissions: totalSubmissions || 0,
          });
        }

        // Sort by status priority (error, pending, success)
        syncStatuses.sort((a, b) => {
          const priority = { error: 0, pending: 1, success: 2 };
          return priority[a.status] - priority[b.status];
        });

        setSyncStatuses(syncStatuses.slice(0, 8)); // Show top 8
      } catch (error) {
        console.error('Error fetching sync statuses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSyncStatuses();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Sync className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'Synced';
      case 'pending':
        return 'Pending';
      case 'error':
        return 'Sync Error';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sync Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
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
        <CardTitle>Sync Status Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {syncStatuses.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No active field officers found
            </p>
          ) : (
            syncStatuses.map((officer) => (
              <div key={officer.officer_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(officer.status)}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {officer.officer_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {officer.total_submissions} submissions
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge variant="secondary" className={getStatusColor(officer.status)}>
                    {getStatusText(officer.status)}
                  </Badge>
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(officer.last_sync), { addSuffix: true })}
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

export default SyncStatusOverview;
