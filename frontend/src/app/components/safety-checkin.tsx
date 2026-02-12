import { useState, useEffect } from 'react';
import { tasks } from '@/app/services/api';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Shield, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface SafetyCheckInProps {
  userId: string;
  onCheckIn: (status: boolean) => void;
}

export default function SafetyCheckIn({ userId, onCheckIn }: SafetyCheckInProps) {
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [checkedInToday, setCheckedInToday] = useState(false);

  const fetchCheckIns = async () => {
    try {
      const allTasks = await tasks.getAll(userId);
      const checkIns = allTasks
        .filter((t: any) => t.category === 'safety' && t.isCompleted)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Newest first

      if (checkIns.length > 0) {
        const last = checkIns[0];
        setLastCheckIn(last.createdAt || new Date().toISOString());

        const lastDate = new Date(last.createdAt).toDateString();
        const today = new Date().toDateString();
        const isToday = lastDate === today;

        setCheckedInToday(isToday);
        onCheckIn(isToday);
      } else {
        setCheckedInToday(false);
        onCheckIn(false);
        setLastCheckIn(null);
      }
    } catch (error) {
      console.error("Failed to fetch check-ins", error);
    }
  };

  useEffect(() => {
    if (userId) fetchCheckIns();
  }, [userId]);

  const handleCheckIn = async () => {
    try {
      await tasks.create({
        userId,
        title: 'Safety Check-in',
        category: 'safety',
        isCompleted: true,
        time: new Date().toISOString()
      });

      await fetchCheckIns();

      toast.success('Safety check-in completed!', {
        description: 'Your emergency contacts have been notified that you are safe.',
        icon: '✅',
      });
    } catch (error) {
      toast.error('Failed to check in');
    }
  };

  const getTimeSinceCheckIn = () => {
    if (!lastCheckIn) return null;

    const now = new Date();
    const lastTime = new Date(lastCheckIn);
    const diff = now.getTime() - lastTime.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  };

  return (
    <Card className="shadow-xl border-orange-100">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
        <CardTitle className="text-orange-900 flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Safety Check-In
        </CardTitle>
        <CardDescription>
          Let your emergency contacts know you're safe
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="max-w-2xl mx-auto">
          {/* Status Card */}
          <Card className={`border-2 mb-6 ${checkedInToday
              ? 'border-green-300 bg-green-50'
              : 'border-orange-300 bg-orange-50'
            }`}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${checkedInToday ? 'bg-green-200' : 'bg-orange-200'
                  }`}>
                  {checkedInToday ? (
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-12 h-12 text-orange-600" />
                  )}
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${checkedInToday ? 'text-green-900' : 'text-orange-900'
                  }`}>
                  {checkedInToday ? 'You\'re All Set!' : 'Check-In Required'}
                </h3>
                <p className={`mb-4 ${checkedInToday ? 'text-green-700' : 'text-orange-700'
                  }`}>
                  {checkedInToday
                    ? 'You have completed your safety check-in today.'
                    : 'Please perform your daily safety check-in to let your contacts know you are safe.'}
                </p>
                {lastCheckIn && (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
                    <Clock className="w-4 h-4" />
                    <span>Last check-in: {getTimeSinceCheckIn()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Check-In Button */}
          <div className="text-center mb-6">
            <Button
              onClick={handleCheckIn}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-12 py-6 text-lg"
            >
              <CheckCircle className="w-6 h-6 mr-2" />
              {checkedInToday ? 'Check In Again' : 'Perform Safety Check-In'}
            </Button>
          </div>

          {/* Information Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <h4 className="font-semibold text-blue-900 mb-2">What is Safety Check-In?</h4>
                <p className="text-sm text-blue-700">
                  A daily confirmation that you are safe and well. If you miss check-ins for an extended period,
                  your emergency contacts will be automatically notified.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="pt-4">
                <h4 className="font-semibold text-purple-900 mb-2">Why It Matters</h4>
                <p className="text-sm text-purple-700">
                  Regular check-ins help ensure your loved ones know you're okay, especially if you live alone
                  or have health concerns. It provides peace of mind for everyone.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Warning Message */}
          <Card className="mt-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm text-orange-800">
                    <strong>Important:</strong> If you don't check in for more than 12 hours,
                    your emergency contacts will be automatically alerted. Make sure to check in daily!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
