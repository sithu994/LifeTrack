import { useState, useEffect } from 'react';
import { tasks } from '@/app/services/api';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Pill, Plus, Check, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Medicine {
  _id?: string;
  id?: string; // Support both for compatibility during migration
  title: string;
  time?: string;
  isCompleted?: boolean;
  taken?: boolean; // Support both
  takenAt?: string;
  notes?: string; // Store dosage here for now
}

interface MedicineTrackerProps {
  userId: string;
  onUpdate: (count: number) => void;
}

export default function MedicineTracker({ userId, onUpdate }: MedicineTrackerProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    dosage: '',
    time: '',
  });

  const fetchMedicines = async () => {
    try {
      const allTasks = await tasks.getAll(userId);
      const medicineTasks = allTasks.filter((t: any) => t.category === 'medicine');
      // Map API task to component state format if needed, or just use it directly
      // adapting to match existing component structure where possible
      const mappedMedicines = medicineTasks.map((t: any) => ({
        id: t._id,
        name: t.title,
        dosage: t.notes || '', // Using notes for dosage
        time: t.time || '',
        taken: t.isCompleted,
        takenAt: t.updatedAt, // Approximate
      }));
      setMedicines(mappedMedicines);
    } catch (error) {
      console.error("Failed to fetch medicines", error);
      toast.error("Failed to load medicines");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchMedicines();
  }, [userId]);

  useEffect(() => {
    const takenCount = medicines.filter(m => m.taken).length;
    onUpdate(takenCount);
  }, [medicines, onUpdate]);

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await tasks.create({
        userId,
        title: newMedicine.name,
        category: 'medicine',
        time: newMedicine.time,
        notes: newMedicine.dosage, // Storing dosage in notes
        isCompleted: false,
      });

      await fetchMedicines();
      setNewMedicine({ name: '', dosage: '', time: '' });
      setShowAddForm(false);
      toast.success('Medicine added successfully!');
    } catch (error) {
      toast.error('Failed to add medicine');
    }
  };

  const markAsTaken = async (id: string) => {
    try {
      // Find the medicine to get its current status (optimistic update is also possible)
      const med = medicines.find(m => m.id === id);
      if (!med) return;

      await tasks.update(id, { isCompleted: true });

      setMedicines(medicines.map(med =>
        med.id === id
          ? { ...med, taken: true, takenAt: new Date().toISOString() }
          : med
      ));
      toast.success('Medicine marked as taken!', {
        icon: '💊',
      });
    } catch (error) {
      toast.error('Failed to update medicine');
    }
  };

  const resetDaily = async () => {
    // This functionality might need a backend endpoint or bulk update
    // For now, we'll just show a toast as it's complex to implement efficiently without backend support for bulk reset
    toast.info('Daily reset not yet implemented in backend');
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading medicines...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-blue-100">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Pill className="w-6 h-6" />
                Medicine Tracker
              </CardTitle>
              <CardDescription>
                Track your daily medications and never miss a dose
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {/* Reset Daily removed/disabled for now as it requires backend logic */}
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Medicine
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Add Medicine Form */}
          {showAddForm && (
            <Card className="mb-6 border-blue-200 bg-blue-50/50">
              <CardContent className="pt-6">
                <form onSubmit={handleAddMedicine} className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="medicineName">Medicine Name</Label>
                      <Input
                        id="medicineName"
                        type="text"
                        placeholder="e.g., Aspirin"
                        value={newMedicine.name}
                        onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                        className="border-blue-200"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input
                        id="dosage"
                        type="text"
                        placeholder="e.g., 500mg"
                        value={newMedicine.dosage}
                        onChange={(e) => setNewMedicine({ ...newMedicine, dosage: e.target.value })}
                        className="border-blue-200"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newMedicine.time}
                        onChange={(e) => setNewMedicine({ ...newMedicine, time: e.target.value })}
                        className="border-blue-200"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      Add Medicine
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Medicine List */}
          {medicines.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Pill className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="mb-2">No medicines added yet</p>
              <p className="text-sm">Click "Add Medicine" to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {medicines.map((medicine) => (
                <Card
                  key={medicine.id}
                  className={`border-2 transition-all ${medicine.taken
                      ? 'border-green-300 bg-green-50'
                      : 'border-blue-200 bg-white hover:shadow-md'
                    }`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${medicine.taken ? 'bg-green-200' : 'bg-blue-100'
                          }`}>
                          {medicine.taken ? (
                            <Check className="w-6 h-6 text-green-600" />
                          ) : (
                            <Pill className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {medicine.name}
                          </h4>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-gray-600">
                              💊 {medicine.dosage}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {medicine.time}
                            </p>
                          </div>
                          {medicine.taken && medicine.takenAt && (
                            <p className="text-xs text-green-600 mt-1">
                              ✓ Taken at {new Date(medicine.takenAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: undefined
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        {!medicine.taken ? (
                          <Button
                            onClick={() => markAsTaken(medicine.id!)}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Mark as Taken
                          </Button>
                        ) : (
                          <div className="px-4 py-2 bg-green-100 rounded-lg">
                            <span className="text-green-700 font-semibold">✓ Completed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Warning for missed medicines */}
          {medicines.some(m => !m.taken) && (
            <Card className="mt-6 border-orange-200 bg-orange-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <p className="text-sm text-orange-800">
                    <strong>Reminder:</strong> You have {medicines.filter(m => !m.taken).length} medicine(s) pending today.
                    Don't forget to take them on time!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
