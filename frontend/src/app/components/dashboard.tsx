import { useState, useEffect } from 'react';
import { tasks } from '@/app/services/api';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Heart, Pill, UtensilsCrossed, Droplets, Calendar, Shield, Users, LogOut, Bell, CheckCircle2, AlertTriangle } from 'lucide-react';
import MedicineTracker from '@/app/components/medicine-tracker';
import MealTracker from '@/app/components/meal-tracker';
import HydrationTracker from '@/app/components/hydration-tracker';
import AppointmentsView from '@/app/components/appointments-view';
import SafetyCheckIn from '@/app/components/safety-checkin';
import EmergencyContacts from '@/app/components/emergency-contacts';

interface User {
  id: string;
  name: string;
  email: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

interface TaskStatus {
  medicines: number;
  meals: number;
  hydration: number;
  checkIn: boolean;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>({
    medicines: 0,
    meals: 0,
    hydration: 0,
    checkIn: false,
  });

  // Fetch tasks for summary
  const fetchTasks = async () => {
    try {
      if (!user?.id) return;
      const userTasks = await tasks.getAll(user.id);

      // Calculate counts
      const medicines = userTasks.filter(t => t.category === 'medicine' && t.isCompleted).length;
      const meals = userTasks.filter(t => t.category === 'meal' && t.isCompleted).length;
      const hydration = userTasks.filter(t => t.category === 'hydration' && t.isCompleted).length;
      const checkIn = userTasks.some(t => t.category === 'safety' && t.isCompleted && new Date(t.createdAt!).toDateString() === new Date().toDateString());

      setTaskStatus({
        medicines,
        meals,
        hydration,
        checkIn,
      });
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  };

  useEffect(() => {
    if (user?.id) fetchTasks();
  }, [user?.id]);

  // Check for missed tasks and send alerts
  useEffect(() => {
    const checkMissedTasks = () => {
      const now = new Date();
      const lastCheckIn = localStorage.getItem('last_checkin');

      // Check if safety check-in was missed (12 hours)
      if (lastCheckIn) {
        const lastCheckInTime = new Date(lastCheckIn);
        const hoursSinceCheckIn = (now.getTime() - lastCheckInTime.getTime()) / (1000 * 60 * 60);

        if (hoursSinceCheckIn > 12 && !taskStatus.checkIn) {
          // Trigger emergency alert
          sendEmergencyAlert('Safety check-in missed for over 12 hours');
        }
      }
    };

    const interval = setInterval(checkMissedTasks, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [taskStatus]);

  const sendEmergencyAlert = (message: string) => {
    console.log('Emergency Alert:', message);
    // In production, this would trigger email/SMS to emergency contacts
  };

  const updateTaskStatus = (task: keyof TaskStatus, value: number | boolean) => {
    setTaskStatus(prev => ({
      ...prev,
      [task]: value,
    }));
  };

  const todayStats = {
    medicinesTaken: taskStatus.medicines,
    mealsCompleted: taskStatus.meals,
    waterIntake: taskStatus.hydration,
    safetyCheckIn: taskStatus.checkIn,
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Heart className="w-7 h-7 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">LifeTrack</h1>
                <p className="text-blue-100 text-sm">Welcome back, {user.name}!</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end text-white">
                <span className="text-sm font-semibold">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
                <span className="text-xs text-blue-100 uppercase tracking-wider">
                  {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                >
                  <Bell className="w-4 h-4" />
                </Button>
                <Button
                  onClick={onLogout}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 shadow-md transition-all duration-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation */}
          <TabsList className="grid grid-cols-7 lg:w-full h-auto gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-md">
            <TabsTrigger value="overview" className="flex flex-col items-center gap-1 py-3">
              <Heart className="w-5 h-5" />
              <span className="text-xs">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="medicine" className="flex flex-col items-center gap-1 py-3">
              <Pill className="w-5 h-5" />
              <span className="text-xs">Medicine</span>
            </TabsTrigger>
            <TabsTrigger value="meals" className="flex flex-col items-center gap-1 py-3">
              <UtensilsCrossed className="w-5 h-5" />
              <span className="text-xs">Meals</span>
            </TabsTrigger>
            <TabsTrigger value="hydration" className="flex flex-col items-center gap-1 py-3">
              <Droplets className="w-5 h-5" />
              <span className="text-xs">Water</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex flex-col items-center gap-1 py-3">
              <Calendar className="w-5 h-5" />
              <span className="text-xs">Appointments</span>
            </TabsTrigger>
            <TabsTrigger value="safety" className="flex flex-col items-center gap-1 py-3">
              <Shield className="w-5 h-5" />
              <span className="text-xs">Check-In</span>
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex flex-col items-center gap-1 py-3">
              <Users className="w-5 h-5" />
              <span className="text-xs">Contacts</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Today's Summary */}
            <Card className="shadow-xl border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
                <CardTitle className="text-blue-900">Today's Summary</CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <Pill className="w-8 h-8 text-blue-600" />
                        <span className="text-2xl font-bold text-blue-900">
                          {todayStats.medicinesTaken}
                        </span>
                      </div>
                      <p className="text-sm text-blue-700">Medicines Taken</p>
                    </CardContent>
                  </Card>

                  <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <UtensilsCrossed className="w-8 h-8 text-cyan-600" />
                        <span className="text-2xl font-bold text-cyan-900">
                          {todayStats.mealsCompleted}/3
                        </span>
                      </div>
                      <p className="text-sm text-cyan-700">Meals Completed</p>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <Droplets className="w-8 h-8 text-blue-600" />
                        <span className="text-2xl font-bold text-blue-900">
                          {todayStats.waterIntake}/8
                        </span>
                      </div>
                      <p className="text-sm text-blue-700">Glasses of Water</p>
                    </CardContent>
                  </Card>

                  <Card className={`border-2 ${todayStats.safetyCheckIn ? 'border-green-300 bg-gradient-to-br from-green-50 to-green-100' : 'border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100'}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        {todayStats.safetyCheckIn ? (
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-8 h-8 text-orange-600" />
                        )}
                        <span className={`text-2xl font-bold ${todayStats.safetyCheckIn ? 'text-green-900' : 'text-orange-900'}`}>
                          {todayStats.safetyCheckIn ? '✓' : '!'}
                        </span>
                      </div>
                      <p className={`text-sm ${todayStats.safetyCheckIn ? 'text-green-700' : 'text-orange-700'}`}>
                        Safety Check-In
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card
                className="shadow-lg border-blue-200 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setActiveTab('medicine')}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Pill className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Log Medicine</h3>
                      <p className="text-sm text-gray-600">Track medication intake</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="shadow-lg border-cyan-200 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setActiveTab('meals')}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                      <UtensilsCrossed className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Log Meal</h3>
                      <p className="text-sm text-gray-600">Record your meals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="shadow-lg border-orange-200 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setActiveTab('safety')}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Check In</h3>
                      <p className="text-sm text-gray-600">Confirm you're safe</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Medicine Tab */}
          <TabsContent value="medicine">
            <MedicineTracker userId={user.id} onUpdate={(count) => updateTaskStatus('medicines', count)} />
          </TabsContent>

          {/* Meals Tab */}
          <TabsContent value="meals">
            <MealTracker userId={user.id} onUpdate={(count) => updateTaskStatus('meals', count)} />
          </TabsContent>

          {/* Hydration Tab */}
          <TabsContent value="hydration">
            <HydrationTracker userId={user.id} onUpdate={(count) => updateTaskStatus('hydration', count)} />
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <AppointmentsView userId={user.id} />
          </TabsContent>

          {/* Safety Tab */}
          <TabsContent value="safety">
            <div className="grid md:grid-cols-2 gap-6">
              <SafetyCheckIn userId={user.id} onCheckIn={(status) => updateTaskStatus('checkIn', status)} />
              <EmergencyContacts />
            </div>
          </TabsContent>
          {/* Emergency Contacts Tab */}
          <TabsContent value="emergency">
            <EmergencyContacts />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
