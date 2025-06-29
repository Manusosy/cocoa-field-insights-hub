
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar';
import { Search, Filter, Download, Users, TrendingUp, MapPin, FileText } from 'lucide-react';

interface Officer {
  id: string;
  full_name: string;
  role: string;
  phone_number: string;
  region: string;
  sub_county: string;
  is_active: boolean;
  created_at: string;
  visit_count: number;
  farmer_count: number;
}

const Reports = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'field_officer')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Get visit counts for each officer
        const officersWithStats = await Promise.all(
          (profiles || []).map(async (officer) => {
            const [{ count: visitCount }, { count: farmerCount }] = await Promise.all([
              supabase
                .from('farm_visits')
                .select('*', { count: 'exact', head: true })
                .eq('field_officer_id', officer.id),
              supabase
                .from('farmers')
                .select('*', { count: 'exact', head: true })
                .eq('registered_by', officer.id)
            ]);

            return {
              ...officer,
              visit_count: visitCount || 0,
              farmer_count: farmerCount || 0,
            };
          })
        );

        setOfficers(officersWithStats);
      } catch (error) {
        console.error('Error fetching officers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOfficers();
  }, []);

  const filteredOfficers = officers.filter(officer => {
    const matchesSearch = officer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         officer.region?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && officer.is_active) ||
                         (statusFilter === 'inactive' && !officer.is_active);
    const matchesRegion = regionFilter === 'all' || officer.region === regionFilter;
    
    return matchesSearch && matchesStatus && matchesRegion;
  });

  const totalStats = {
    total: officers.length,
    active: officers.filter(o => o.is_active).length,
    totalVisits: officers.reduce((sum, o) => sum + o.visit_count, 0),
    totalFarmers: officers.reduce((sum, o) => sum + o.farmer_count, 0),
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Field Officer Reports</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Field Officer Reports</h1>
        <Button className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Officers</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Officers</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 rounded-lg">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Visits</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.totalVisits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-50 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Farmers</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.totalFarmers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name or region..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {Array.from(new Set(officers.map(o => o.region).filter(Boolean))).map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Officers List */}
      <Card>
        <CardHeader>
          <CardTitle>Field Officers Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOfficers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No field officers found</p>
              </div>
            ) : (
              filteredOfficers.map((officer) => (
                <div key={officer.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>
                        <AvatarInitials name={officer.full_name} />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-gray-900">{officer.full_name}</h3>
                      <p className="text-sm text-gray-500">{officer.region} • {officer.sub_county}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{officer.visit_count}</p>
                      <p className="text-xs text-gray-500">Visits</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{officer.farmer_count}</p>
                      <p className="text-xs text-gray-500">Farmers</p>
                    </div>
                    <Badge variant={officer.is_active ? "default" : "secondary"}>
                      {officer.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
