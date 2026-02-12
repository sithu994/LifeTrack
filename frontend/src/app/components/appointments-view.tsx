import { useState, useEffect } from 'react';
import { tasks } from '@/app/services/api';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Calendar, Plus, MapPin, Clock, User, Trash2 } from 'lucide-react';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  doctor: string;
  notes: string;
}

interface AppointmentsViewProps {
  userId: string;
}

export default function AppointmentsView({ userId }: AppointmentsViewProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const fetchAppointments = async () => {
    try {
      const allTasks = await tasks.getAll(userId);
      const apptTasks = allTasks.filter((t: any) => t.category === 'appointment');

      const mappedAppts = apptTasks.map((t: any) => {
        // Parse notes/other fields if stored as JSON or string delimiters, 
        // but for now we'll assume simple storage or partial data
        // Ideally we'd store structured data in the backend, but using `notes` for flex fields:
        // Format: "Doctor: X | Location: Y | Notes: Z"

        let doctor = '';
        let location = '';
        let notes = '';

        if (t.notes) {
          const parts = t.notes.split('|');
          parts.forEach((p: string) => {
            const [key, val] = p.split(':').map((s: string) => s.trim());
            if (key === 'Doctor') doctor = val;
            if (key === 'Location') location = val;
            if (key === 'Notes') notes = val;
            // Fallback for simple notes
            if (!key && p) notes = p;
          });
        }

        // Parse date/time from t.time (ISO string)
        const dateObj = t.time ? new Date(t.time) : new Date();
        const dateStr = dateObj.toISOString().split('T')[0];
        const timeStr = dateObj.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

        return {
          id: t._id,
          title: t.title,
          date: dateStr,
          time: timeStr,
          location,
          doctor,
          notes
        };
      });

      setAppointments(mappedAppts.sort((a: any, b: any) =>
        new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime()
      ));
    } catch (error) {
      console.error("Failed to fetch appointments", error);
    }
  };

  useEffect(() => {
    if (userId) fetchAppointments();
  }, [userId]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    doctor: '',
    notes: '',
  });

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Construct rich notes
      const richNotes = `Doctor: ${newAppointment.doctor} | Location: ${newAppointment.location} | Notes: ${newAppointment.notes}`;
      const dateTime = new Date(`${newAppointment.date}T${newAppointment.time}`).toISOString();

      await tasks.create({
        userId,
        title: newAppointment.title,
        category: 'appointment',
        time: dateTime,
        notes: richNotes,
        isCompleted: false
      });

      await fetchAppointments();

      setNewAppointment({
        title: '',
        date: '',
        time: '',
        location: '',
        doctor: '',
        notes: '',
      });
      setShowAddForm(false);
      toast.success('Appointment added successfully!');
    } catch (error) {
      toast.error('Failed to add appointment');
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await tasks.delete(id);
      setAppointments(appointments.filter(apt => apt.id !== id));
      toast.success('Appointment deleted');
    } catch (error) {
      toast.error('Failed to delete appointment');
    }
  };

  const upcomingAppointments = appointments.filter(apt =>
    new Date(apt.date + ' ' + apt.time) >= new Date()
  );

  const pastAppointments = appointments.filter(apt =>
    new Date(apt.date + ' ' + apt.time) < new Date()
  );

  return (
    <Card className="shadow-xl border-purple-100">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-purple-900 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Appointments
            </CardTitle>
            <CardDescription>
              Manage your medical appointments and reminders
            </CardDescription>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Appointment
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Add Form */}
        {showAddForm && (
          <Card className="mb-6 border-purple-200 bg-purple-50/50">
            <CardContent className="pt-6">
              <form onSubmit={handleAddAppointment} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Appointment Title</Label>
                    <Input
                      id="title"
                      value={newAppointment.title}
                      onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                      placeholder="e.g., Doctor Checkup"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor">Doctor Name</Label>
                    <Input
                      id="doctor"
                      value={newAppointment.doctor}
                      onChange={(e) => setNewAppointment({ ...newAppointment, doctor: e.target.value })}
                      placeholder="Dr. Smith"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newAppointment.location}
                    onChange={(e) => setNewAppointment({ ...newAppointment, location: e.target.value })}
                    placeholder="Hospital/Clinic address"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                    placeholder="Any additional notes..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                    Add Appointment
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

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <Card key={apt.id} className="border-purple-200 hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg mb-2">{apt.title}</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            <span>{new Date(apt.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-600" />
                            <span>{apt.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-purple-600" />
                            <span>{apt.doctor}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-purple-600" />
                            <span>{apt.location}</span>
                          </div>
                          {apt.notes && (
                            <p className="text-gray-700 mt-2 italic">Note: {apt.notes}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => deleteAppointment(apt.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-500 mb-4">Past Appointments</h3>
            <div className="space-y-3 opacity-60">
              {pastAppointments.slice(0, 3).map((apt) => (
                <Card key={apt.id} className="border-gray-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-700">{apt.title}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(apt.date).toLocaleDateString()} at {apt.time}
                        </p>
                      </div>
                      <Button
                        onClick={() => deleteAppointment(apt.id)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {appointments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="mb-2">No appointments scheduled</p>
            <p className="text-sm">Click "Add Appointment" to schedule one</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
