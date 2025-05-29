
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NotificationManager = () => {
  const { toast } = useToast();
  const [notificationText, setNotificationText] = useState('');

  const sendNotification = async () => {
    // Mock notification - in real app, use Firebase/OneSignal
    toast({
      title: 'Notification Sent',
      description: `Sent: "${notificationText}" to all users`,
    });
    setNotificationText('');
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Bell className="w-5 h-5" />
          <span>Push Notifications</span>
        </CardTitle>
        <CardDescription className="text-gray-400">
          Send notifications to all users via Firebase/OneSignal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Notification Message</Label>
            <Textarea 
              placeholder="Enter notification message..."
              value={notificationText}
              onChange={(e) => setNotificationText(e.target.value)}
              rows={3}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">Notification Type</Label>
            <Select>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="new_content">New Content</SelectItem>
                <SelectItem value="update">App Update</SelectItem>
                <SelectItem value="promotion">Promotion</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={sendNotification}
          disabled={!notificationText}
          className="bg-red-600 hover:bg-red-700"
        >
          <Bell className="w-4 h-4 mr-2" />
          Send Notification
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationManager;
