import { useState, useEffect } from 'react';
import { tasks } from '@/app/services/api';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { Droplets, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface HydrationTrackerProps {
  userId: string;
  onUpdate: (count: number) => void;
}

interface HydrationTask {
  id: string;
  isCompleted: boolean;
}

export default function HydrationTracker({ userId, onUpdate }: HydrationTrackerProps) {
  const [hydrationTasks, setHydrationTasks] = useState<HydrationTask[]>([]);
  const dailyGoal = 8; // 8 glasses per day

  const fetchHydration = async () => {
    try {
      const allTasks = await tasks.getAll(userId);
      const todaysHydration = allTasks.filter((t: any) =>
        t.category === 'hydration' &&
        new Date(t.createdAt).toDateString() === new Date().toDateString()
      );

      setHydrationTasks(todaysHydration.map((t: any) => ({
        id: t._id,
        isCompleted: t.isCompleted
      })));
    } catch (error) {
      console.error("Failed to fetch hydration", error);
    }
  };

  useEffect(() => {
    if (userId) fetchHydration();
  }, [userId]);

  useEffect(() => {
    const count = hydrationTasks.filter(t => t.isCompleted).length;
    onUpdate(count);
  }, [hydrationTasks, onUpdate]);

  const addGlass = async () => {
    if (hydrationTasks.length < dailyGoal + 4) {
      try {
        await tasks.create({
          userId,
          title: 'Glass of Water',
          category: 'hydration',
          isCompleted: true,
          time: new Date().toISOString()
        });
        await fetchHydration();

        toast.success('Water logged!', {
          icon: '💧',
        });
      } catch (error) {
        toast.error('Failed to log water');
      }
    }
  };

  const removeGlass = async () => {
    if (hydrationTasks.length > 0) {
      try {
        // Remove the most recent glass
        const lastTask = hydrationTasks[hydrationTasks.length - 1];
        await tasks.delete(lastTask.id);

        // Optimistically update or refetch
        setHydrationTasks(prev => prev.slice(0, -1));
        toast.info('Removed glass of water');
      } catch (error) {
        toast.error('Failed to remove glass');
      }
    }
  };

  const glassesCount = hydrationTasks.length;
  const progress = Math.min((glassesCount / dailyGoal) * 100, 100);

  return (
    <Card className="shadow-xl border-blue-100">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
        <CardTitle className="text-blue-900 flex items-center gap-2">
          <Droplets className="w-6 h-6" />
          Hydration Tracker
        </CardTitle>
        <CardDescription>
          Stay hydrated! Track your daily water intake
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="max-w-2xl mx-auto">
          {/* Water Glass Visualization */}
          <div className="relative">
            <div className="w-48 h-64 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-b-full border-4 border-blue-400 bg-gradient-to-b from-blue-50 to-blue-100 overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-400 to-cyan-400 transition-all duration-500"
                  style={{ height: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-blue-400/30 animate-pulse"></div>
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
                <div className="text-5xl font-bold text-blue-900">
                  {glassesCount}
                </div>
                <div className="text-sm text-blue-700">
                  / {dailyGoal} glasses
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Daily Progress</span>
              <span className="text-sm font-semibold text-blue-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              onClick={removeGlass}
              variant="outline"
              size="lg"
              className="border-red-300 text-red-600 hover:bg-red-50"
              disabled={glassesCount === 0}
            >
              <Minus className="w-5 h-5" />
            </Button>
            <Button
              onClick={addGlass}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-8"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Glass
            </Button>
          </div>

          {/* Status Messages */}
          {glassesCount === 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-4">
                <p className="text-center text-orange-800 text-sm">
                  💧 Start your day by drinking a glass of water!
                </p>
              </CardContent>
            </Card>
          )}

          {glassesCount >= dailyGoal && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-4">
                <p className="text-center text-green-800 font-semibold">
                  🎉 Excellent! You've reached your daily hydration goal!
                </p>
              </CardContent>
            </Card>
          )}

          {glassesCount > 0 && glassesCount < dailyGoal && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <p className="text-center text-blue-800 text-sm">
                  Keep going! Just {dailyGoal - glassesCount} more glass{dailyGoal - glassesCount > 1 ? 'es' : ''} to reach your goal! 💪
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
