import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Users, Plus, Phone, Mail, UserPlus, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    const saved = localStorage.getItem('emergency_contacts');
    return saved ? JSON.parse(saved) : [];
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    localStorage.setItem('emergency_contacts', JSON.stringify(contacts));
  }, [contacts]);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();

    const contact: EmergencyContact = {
      id: Date.now().toString(),
      ...newContact,
    };

    setContacts([...contacts, contact]);
    setNewContact({
      name: '',
      relationship: '',
      phone: '',
      email: '',
    });
    setShowAddForm(false);
    toast.success('Emergency contact added successfully!');
  };

  const deleteContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
    toast.success('Contact deleted');
  };

  return (
    <Card className="shadow-xl border-red-100">
      <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Emergency Contacts
            </CardTitle>
            <CardDescription>
              Manage your trusted contacts who will be alerted in case of emergencies
            </CardDescription>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Add Form */}
        {showAddForm && (
          <Card className="mb-6 border-red-200 bg-red-50/50">
            <CardContent className="pt-6">
              <form onSubmit={handleAddContact} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Full Name</Label>
                    <Input
                      id="contactName"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input
                      id="relationship"
                      value={newContact.relationship}
                      onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                      placeholder="e.g., Spouse, Child, Friend"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone Number</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email Address</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={newContact.email}
                      onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      placeholder="contact@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-red-600 hover:bg-red-700">
                    Add Contact
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

        {/* Contacts List */}
        {contacts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="mb-2">No emergency contacts added yet</p>
            <p className="text-sm mb-4">Add trusted contacts who will be notified in emergencies</p>
            <Button
              onClick={() => setShowAddForm(true)}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Your First Contact
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact, index) => (
              <Card
                key={contact.id}
                className="border-red-200 hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {contact.name}
                          </h4>
                          {index === 0 && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {contact.relationship}
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone className="w-4 h-4 text-red-600" />
                            <a href={`tel:${contact.phone}`} className="hover:text-red-600">
                              {contact.phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail className="w-4 h-4 text-red-600" />
                            <a href={`mailto:${contact.email}`} className="hover:text-red-600">
                              {contact.email}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => deleteContact(contact.id)}
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
        )}

        {/* Information Card */}
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">How Emergency Alerts Work</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Contacts will be notified if you miss critical tasks (medicines, check-ins)</li>
                  <li>Alerts are sent via email and SMS (if configured)</li>
                  <li>The primary contact (first in list) receives immediate notifications</li>
                  <li>We recommend adding at least 2-3 trusted contacts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {contacts.length > 0 && contacts.length < 2 && (
          <Card className="mt-4 border-orange-200 bg-orange-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <p className="text-sm text-orange-800">
                  <strong>Tip:</strong> Add at least 2 emergency contacts for better safety coverage.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
