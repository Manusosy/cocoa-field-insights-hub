
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye } from 'lucide-react';

interface Officer {
  id: string;
  full_name: string;
  uai_code: string;
  region: string;
  sub_county: string;
  assigned_supervisor: {
    full_name: string;
  } | null;
  targets: {
    total_farm_target: number;
    visit_1_target: number;
    visit_2_target: number;
    visit_3_target: number;
    visit_4_target: number;
    visit_5_target: number;
    visit_6_target: number;
    visit_7_target: number;
  } | null;
  visit_counts: {
    visit_1: number;
    visit_2: number;
    visit_3: number;
    visit_4: number;
    visit_5: number;
    visit_6: number;
    visit_7: number;
  };
}

const Officers = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        // Fetch field officers with their targets and supervisor info
        const { data: officersData, error } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            uai_code,
            region,
            sub_county,
            assigned_supervisor:assigned_supervisor_id(full_name),
            targets:officer_targets(
              total_farm_target,
              visit_1_target,
              visit_2_target,
              visit_3_target,
              visit_4_target,
              visit_5_target,
              visit_6_target,
              visit_7_target
            )
          `)
          .eq('role', 'field_officer');

        if (error) throw error;

        // For each officer, get their visit counts
        const officersWithCounts = await Promise.all(
          (officersData || []).map(async (officer) => {
            const visitCounts = { visit_1: 0, visit_2: 0, visit_3: 0, visit_4: 0, visit_5: 0, visit_6: 0, visit_7: 0 };
            
            for (let i = 1; i <= 7; i++) {
              const { count } = await supabase
                .from('farm_visits')
                .select('*', { count: 'exact', head: true })
                .eq('field_officer_id', officer.id)
                .eq('visit_number', i);
              
              visitCounts[`visit_${i}` as keyof typeof visitCounts] = count || 0;
            }

            return {
              ...officer,
              visit_counts: visitCounts,
            };
          })
        );

        setOfficers(officersWithCounts);
      } catch (error) {
        console.error('Error fetching officers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOfficers();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="grid grid-cols-7 gap-2">
                  {[...Array(7)].map((_, j) => (
                    <div key={j} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
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
          Field Officers Dashboard
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Monitor field officer performance and visit progress
        </p>
      </div>

      <div className="grid gap-6">
        {officers.map((officer) => (
          <Card key={officer.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    <Link 
                      to={`/officers/${officer.id}`}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {officer.full_name}
                    </Link>
                  </CardTitle>
                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                    <span>UAI: {officer.uai_code || 'N/A'}</span>
                    <span>Region: {officer.region || 'N/A'}</span>
                    <span>Supervisor: {officer.assigned_supervisor?.full_name || 'N/A'}</span>
                  </div>
                </div>
                <Link 
                  to={`/officers/${officer.id}`}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Farm Target</span>
                  <Badge variant="outline">
                    {officer.targets?.total_farm_target || 25} farms
                  </Badge>
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((visitNum) => {
                    const target = officer.targets?.[`visit_${visitNum}_target` as keyof typeof officer.targets] || 25;
                    const completed = officer.visit_counts[`visit_${visitNum}` as keyof typeof officer.visit_counts];
                    const percentage = target > 0 ? (completed / target) * 100 : 0;
                    
                    return (
                      <div key={visitNum} className="text-center">
                        <div className="text-xs font-medium text-gray-600 mb-1">
                          Visit {visitNum}
                        </div>
                        <div className="space-y-1">
                          <Progress value={percentage} className="h-2" />
                          <div className="text-xs text-gray-500">
                            {completed}/{target}
                          </div>
                          <div className="text-xs font-medium">
                            {Math.round(percentage)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {officers.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No field officers found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Officers;
