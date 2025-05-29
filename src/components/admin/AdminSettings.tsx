
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Save, Settings } from 'lucide-react';
import { AdminSettings as AdminSettingsType } from '@/types/admin';

interface AdminSettingsProps {
  adminSettings: AdminSettingsType;
  setAdminSettings: (settings: AdminSettingsType) => void;
  onSave: () => void;
}

const AdminSettings = ({ adminSettings, setAdminSettings, onSave }: AdminSettingsProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>General Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="notifications"
                checked={adminSettings.notifications}
                onCheckedChange={(checked) => 
                  setAdminSettings({...adminSettings, notifications: checked})
                }
              />
              <Label htmlFor="notifications" className="text-white">Enable Notifications</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="watchHistory"
                checked={adminSettings.watchHistory}
                onCheckedChange={(checked) => 
                  setAdminSettings({...adminSettings, watchHistory: checked})
                }
              />
              <Label htmlFor="watchHistory" className="text-white">Watch History</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="autoFetch"
                checked={adminSettings.autoFetchTrailers}
                onCheckedChange={(checked) => 
                  setAdminSettings({...adminSettings, autoFetchTrailers: checked})
                }
              />
              <Label htmlFor="autoFetch" className="text-white">Auto-Fetch Trailers</Label>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Database Provider</Label>
              <Select 
                value={adminSettings.database} 
                onValueChange={(value: 'supabase' | 'firebase') => 
                  setAdminSettings({...adminSettings, database: value})
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="supabase">Supabase</SelectItem>
                  <SelectItem value="firebase">Firebase</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Social Media Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Input 
                placeholder="YouTube Channel" 
                defaultValue="https://www.youtube.com/@Jgroupsentertainmenthub048"
                className="bg-gray-800 border-gray-600 text-white"
              />
              <Input 
                placeholder="Facebook Page" 
                defaultValue="https://www.facebook.com/profile.php?id=61573079981019"
                className="bg-gray-800 border-gray-600 text-white"
              />
              <Input 
                placeholder="Instagram Profile" 
                defaultValue="https://www.instagram.com/mflix_entertainmenthub?igsh=eTFrOHY4bmNnYmli"
                className="bg-gray-800 border-gray-600 text-white"
              />
              <Input 
                placeholder="Telegram Group" 
                defaultValue="https://t.me/+nRJaGvh8DMNlMzNl"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={onSave} className="bg-red-600 hover:bg-red-700">
        <Save className="w-4 h-4 mr-2" />
        Save All Settings
      </Button>
    </div>
  );
};

export default AdminSettings;
