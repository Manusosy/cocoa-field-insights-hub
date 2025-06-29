
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar';
import { Search, Download, Plus, Eye, MapPin, Phone, Calendar, Users, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FieldOfficer {
  id: string;
  full_name: string;
  phone_number: string;
  region: string;
  sub_county: string;
  uai_code: string;
  is_active: boolean;
  created_at: string;
  assigned_supervisor_id: string;
  visit_count: number;
  farmer_count: number;
  last_visit_date: string;
  progress_percentage: number;
}

const Officers = () => {
  const [officers, setOfficers] = useState<FieldOfficer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [selectedOfficer, setSelectedOfficer] = useState<FieldOfficer | null>(null);

  useEffect(() => {
    const fetchFieldOfficers = async () => {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'field_officer')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Get detailed stats for each officer
        const officersWithStats = await Promise.all(
          (profiles || []).map(async (officer) => {
            const [
              { count: visitCount },
              { count: farmerCount },
              { data: lastVisit },
              { data: target }
            ] = await Promise.all([
              supabase
                .from('farm_visits')
                .select('*', { count: 'exact', head: true })
                .eq('field_officer_id', officer.id),
              supabase
                .from('farmers')
                .select('*', { count: 'exact', head: true })
                .eq('registered_by', officer.id),
              supabase
                .from('farm_visits')
                .select('visit_date')
                .eq('field_officer_id', officer.id)
                .order('visit_date', { ascending: false })
                .limit(1)
                .maybeSingle(),
              supabase
                .from('officer_targets')
                .select('total_farm_target')
                .eq('field_officer_id', officer.id)
                .maybeSingle()
            ]);

            const progress = target?.total_farm_target 
              ? Math.round((visitCount / target.total_farm_target) * 100)
              : 0;

            return {
              ...officer,
              visit_count: visitCount || 0,
              farmer_count: farmerCount || 0,
              last_visit_date: lastVisit?.visit_date || null,
              progress_percentage: Math.min(progress, 100),
            };
          })
        );

        setOfficers(officersWithStats);
      } catch (error) {
        console.error('Error fetching field officers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFieldOfficers();
  }, []);

  const filteredOfficers = officers.filter(officer => {
    const matchesSearch = officer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         officer.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         officer.uai_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && officer.is_active) ||
                         (statusFilter === 'inactive' && !officer.is_active);
    const matchesRegion = regionFilter === 'all' || officer.region === regionFilter;
    
    return matchesSearch && matchesStatus && matchesRegion;
  });

  const exportToCsv = () => {
    const csvData = filteredOfficers.map(officer => ({
      'Officer Name': officer.full_name,
      'UAI Code': officer.uai_code || 'N/A',
      'Phone': officer.phone_number || 'N/A',
      'Region': officer.region || 'N/A',
      'Sub County': officer.sub_county || 'N/A',
      'Status': officer.is_active ? 'Active' : 'Inactive',
      'Farm Visits': officer.visit_count,
      'Farmers Registered': officer.farmer_count,
      'Progress': `${officer.progress_percentage}%`,
      'Last Visit': officer.last_visit_date ? new Date(officer.last_visit_date).toLocaleDateString() : 'Never',
      'Joined': new Date(officer.created_at).toLocaleDateString()
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `field-officers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Field Officers Management</h1>
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Field Officers Management</h1>
        <div className="flex space-x-2">
          <Button onClick={exportToCsv} variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Officer</span>
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Officers</p>
                <p className="text-2xl font-bold text-gray-900">{officers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-bold text-gray-900">{officers.filter(o => o.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Visits</p>
                <p className="text-2xl font-bold text-gray-900">{officers.reduce((sum, o) => sum + o.visit_count, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Farmers</p>
                <p className="text-2xl font-bold text-gray-900">{officers.reduce((sum, o) => sum + o.farmer_count, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, region, or UAI code..."
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

      {/* Officers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Field Officers ({filteredOfficers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Officer</TableHead>
                <TableHead>UAI Code</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Field Visits</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOfficers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <Users className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">No field officers found</p>
                      <p className="text-sm text-gray-400">Officers will appear here when they register via the mobile app</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOfficers.map((officer) => (
                  <TableRow key={officer.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            <AvatarInitials name={officer.full_name} />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{officer.full_name}</p>
                          <p className="text-sm text-gray-500">{officer.phone_number || 'No phone'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{officer.uai_code || 'Not assigned'}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{officer.region || 'Not assigned'}</p>
                        <p className="text-sm text-gray-500">{officer.sub_county || 'No sub-county'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <p className="font-medium">{officer.visit_count}</p>
                        <p className="text-xs text-gray-500">{officer.farmer_count} farmers</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${officer.progress_percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{officer.progress_percentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={officer.is_active ? "default" : "secondary"}>
                        {officer.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {officer.last_visit_date 
                          ? formatDistanceToNow(new Date(officer.last_visit_date), { addSuffix: true })
                          : 'Never'
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOfficer(officer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback>
                                  <AvatarInitials name={officer.full_name} />
                                </AvatarFallback>
                              </Avatar>
                              <span>{officer.full_name}</span>
                            </DialogTitle>
                            <DialogDescription>
                              Field officer details and performance overview
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-500">Contact Information</p>
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">{officer.phone_number || 'Not provided'}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">{officer.region}, {officer.sub_county}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">Joined {formatDistanceToNow(new Date(officer.created_at), { addSuffix: true })}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-500">Performance Stats</p>
                                <div className="space-y-3">
                                  <div className="flex justify-between">
                                    <span className="text-sm">Farm Visits</span>
                                    <span className="font-medium">{officer.visit_count}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm">Farmers Registered</span>
                                    <span className="font-medium">{officer.farmer_count}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm">Progress</span>
                                    <span className="font-medium">{officer.progress_percentage}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm">Status</span>
                                    <Badge variant={officer.is_active ? "default" : "secondary"}>
                                      {officer.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" className="flex-1">
                                Assign Farms
                              </Button>
                              <Button variant="outline" className="flex-1">
                                View Reports
                              </Button>
                              <Button variant="outline" className="flex-1">
                                Message
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Officers;
