
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Map, MapPin, Camera, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface GeographicSubmission {
  id: string;
  region: string;
  coordinates: {
    lat: number;
    lng: number;
  } | null;
  officer_name: string;
  submission_type: string;
  timestamp: string;
}

const GeographicOverview = () => {
  const [submissions, setSubmissions] = useState<GeographicSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGeographicData = async () => {
      try {
        // Get recent geolocated submissions
        const { data: visits, error } = await supabase
          .from('farm_visits')
          .select(`
            id,
            gps_latitude,
            gps_longitude,
            created_at,
            polygon_boundaries,
            profiles!farm_visits_field_officer_id_fkey (
              full_name,
              region
            )
          `)
          .not('gps_latitude', 'is', null)
          .not('gps_longitude', 'is', null)
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) throw error;

        const geoSubmissions: GeographicSubmission[] = visits?.map(visit => ({
          id: visit.id,
          region: visit.profiles?.region || 'Unknown Region',
          coordinates: visit.gps_latitude && visit.gps_longitude ? {
            lat: parseFloat(visit.gps_latitude.toString()),
            lng: parseFloat(visit.gps_longitude.toString())
          } : null,
          officer_name: visit.profiles?.full_name || 'Unknown Officer',
          submission_type: visit.polygon_boundaries ? 'Farm Polygon' : 'GPS Point',
          timestamp: visit.created_at,
        })) || [];

        setSubmissions(geoSubmissions);
      } catch (error) {
        console.error('Error fetching geographic data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGeographicData();
  }, []);

  const handleViewFullMap = () => {
    // This would open a full-screen map view
    console.log('Opening full map view...');
    // In a real implementation, this would navigate to a dedicated map page
    // or open a modal with an interactive map
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Map className="h-5 w-5" />
            <span>Field Data Geographic Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
              <Map className="h-8 w-8 text-gray-400" />
            </div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 animate-pulse">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Map className="h-5 w-5" />
            <span>Field Data Geographic Overview</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleViewFullMap}
            className="flex items-center space-x-1"
          >
            <Map className="h-4 w-4" />
            <span>View Full Map</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Map Placeholder */}
          <div className="h-32 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
            <div className="text-center">
              <Map className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Interactive Map View</p>
              <p className="text-xs text-gray-400">Click "View Full Map" for details</p>
            </div>
          </div>

          {/* Recent Geolocated Submissions */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Recent Geolocated Submissions</span>
            </h4>
            
            {submissions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No geolocated submissions found
              </p>
            ) : (
              submissions.map((submission) => (
                <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {submission.region}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {submission.submission_type}
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Users className="h-3 w-3 mr-1" />
                        <span className="truncate">{submission.officer_name}</span>
                        {submission.coordinates && (
                          <>
                            <span className="mx-2">•</span>
                            <span>
                              {submission.coordinates.lat.toFixed(4)}, {submission.coordinates.lng.toFixed(4)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(submission.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeographicOverview;
