import { useState, useEffect } from 'react';
import { tasks } from '@/app/services/api';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { UtensilsCrossed, Check, Coffee, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';

interface Meal {
  id?: string;
  type: 'breakfast' | 'lunch' | 'dinner';
  completed: boolean;
  time?: string;
}

interface MealTrackerProps {
  userId: string;
  onUpdate: (count: number) => void;
}

export default function MealTracker({ userId, onUpdate }: MealTrackerProps) {
  const [meals, setMeals] = useState<Meal[]>([
    { type: 'breakfast', completed: false },
    { type: 'lunch', completed: false },
    { type: 'dinner', completed: false },
  ]);

  const fetchMeals = async () => {
    try {
      const allTasks = await tasks.getAll(userId);
      const todaysMeals = allTasks.filter((t: any) =>
        t.category === 'meal' &&
        new Date(t.createdAt).toDateString() === new Date().toDateString()
      );

      const updatedMeals: Meal[] = [
        { type: 'breakfast', completed: false },
        { type: 'lunch', completed: false },
        { type: 'dinner', completed: false },
      ];

      todaysMeals.forEach((t: any) => {
        const index = updatedMeals.findIndex(m => m.type === t.title.toLowerCase());
        if (index !== -1) {
          updatedMeals[index] = {
            id: t._id,
            type: updatedMeals[index].type,
            completed: t.isCompleted,
            time: t.updatedAt
          };
        }
      });

      setMeals(updatedMeals);
    } catch (error) {
      console.error("Failed to fetch meals", error);
    }
  };

  useEffect(() => {
    if (userId) fetchMeals();
  }, [userId]);

  useEffect(() => {
    const completedCount = meals.filter(m => m.completed).length;
    onUpdate(completedCount);
  }, [meals, onUpdate]);

  const completeMeal = async (type: 'breakfast' | 'lunch' | 'dinner') => {
    try {
      const existingMeal = meals.find(m => m.type === type);

      if (!existingMeal?.completed) {
        await tasks.create({
          userId,
          title: type.charAt(0).toUpperCase() + type.slice(1),
          category: 'meal',
          isCompleted: true,
          time: new Date().toISOString()
        });

        await fetchMeals();
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} logged!`, {
          icon: '🍽️',
        });
      }
    } catch (error) {
      toast.error('Failed to log meal');
    }
  };

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast':
        return <Coffee className="w-6 h-6" />;
      case 'lunch':
        return <Sun className="w-6 h-6" />;
      case 'dinner':
        return <Moon className="w-6 h-6" />;
      default:
        return <UtensilsCrossed className="w-6 h-6" />;
    }
  };

  return (
    <Card className="shadow-xl border-cyan-100">
      <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b">
        <CardTitle className="text-cyan-900 flex items-center gap-2">
          <UtensilsCrossed className="w-6 h-6" />
          Meal Tracker
        </CardTitle>
        <CardDescription>
          Track your daily meals and maintain healthy eating habits
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-3 gap-4">
          {meals.map((meal) => (
            <Card
              key={meal.type}
              className={`border-2 transition-all ${meal.completed
                  ? 'border-green-300 bg-green-50'
                  : 'border-cyan-200 bg-white hover:shadow-lg'
                }`}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${meal.completed ? 'bg-green-200' : 'bg-cyan-100'
                    }`}>
                    {meal.completed ? (
                      <Check className="w-8 h-8 text-green-600" />
                    ) : (
                      <span className="text-cyan-600">{getMealIcon(meal.type)}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 capitalize">
                    {meal.type}
                  </h3>
                  {meal.completed && meal.time ? (
                    <p className="text-xs text-green-600 mb-3">
                      Logged at {new Date(meal.time).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mb-3">Not logged yet</p>
                  )}
                  {!meal.completed && (
                    <Button
                      onClick={() => completeMeal(meal.type)}
                      size="sm"
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    >
                      Log {meal.type}
                    </Button>
                  )}
                  {meal.completed && (
                    <div className="px-3 py-1.5 bg-green-100 rounded-lg">
                      <span className="text-green-700 text-sm font-semibold">✓ Completed</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {meals.every(m => m.completed) && (
          <Card className="mt-6 border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-green-800 font-semibold">
                  🎉 Great job! You've logged all your meals for today!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
