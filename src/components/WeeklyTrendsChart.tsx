
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';

interface WeeklyData {
  day: string;
  photos: number;
  videos: number;
  polygons: number;
  reports: number;
}

const WeeklyTrendsChart = () => {
  const [data, setData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeeklyTrends = async () => {
      try {
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const weeklyData: WeeklyData[] = [];

        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          const dayName = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1];
          
          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);

          // Get photos and videos count
          const { count: mediaCount } = await supabase
            .from('visit_media')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startOfDay.toISOString())
            .lte('created_at', endOfDay.toISOString());

          // Get photos count specifically
          const { count: photosCount } = await supabase
            .from('visit_media')
            .select('*', { count: 'exact', head: true })
            .eq('media_type', 'photo')
            .gte('created_at', startOfDay.toISOString())
            .lte('created_at', endOfDay.toISOString());

          // Get videos count specifically
          const { count: videosCount } = await supabase
            .from('visit_media')
            .select('*', { count: 'exact', head: true })
            .eq('media_type', 'video')
            .gte('created_at', startOfDay.toISOString())
            .lte('created_at', endOfDay.toISOString());

          // Get polygons count (visits with polygon data)
          const { count: polygonsCount } = await supabase
            .from('farm_visits')
            .select('*', { count: 'exact', head: true })
            .not('polygon_boundaries', 'is', null)
            .gte('created_at', startOfDay.toISOString())
            .lte('created_at', endOfDay.toISOString());

          // Get reports count (completed visits)
          const { count: reportsCount } = await supabase
            .from('farm_visits')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'completed')
            .gte('created_at', startOfDay.toISOString())
            .lte('created_at', endOfDay.toISOString());

          weeklyData.push({
            day: dayName.substring(0, 3),
            photos: photosCount || 0,
            videos: videosCount || 0,
            polygons: polygonsCount || 0,
            reports: reportsCount || 0,
          });
        }

        setData(weeklyData);
      } catch (error) {
        console.error('Error fetching weekly trends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyTrends();
  }, []);

  const chartConfig = {
    photos: {
      label: 'Photos',
      color: '#3b82f6',
    },
    videos: {
      label: 'Videos',
      color: '#ef4444',
    },
    polygons: {
      label: 'Polygons',
      color: '#10b981',
    },
    reports: {
      label: 'Reports',
      color: '#f59e0b',
    },
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Data Collection Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Data Collection Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="day" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="photos" fill={chartConfig.photos.color} name="Photos" />
              <Bar dataKey="videos" fill={chartConfig.videos.color} name="Videos" />
              <Bar dataKey="polygons" fill={chartConfig.polygons.color} name="Polygons" />
              <Bar dataKey="reports" fill={chartConfig.reports.color} name="Reports" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default WeeklyTrendsChart;
