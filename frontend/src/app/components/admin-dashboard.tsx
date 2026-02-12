import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Shield, LogOut, Plus, Home, Award, User, Calendar, Hash, FileText } from 'lucide-react';
import { Textarea } from '@/app/components/ui/textarea';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

interface Certificate {
  id: string;
  recipientName: string;
  courseName: string;
  issueDate: string;
  issuer: string;
  description: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
  onGoHome: () => void;
}

export default function AdminDashboard({ onLogout, onGoHome }: AdminDashboardProps) {
  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const saved = localStorage.getItem('certificates');
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState({
    recipientName: '',
    courseName: '',
    issueDate: new Date().toISOString().split('T')[0],
    issuer: '',
    description: '',
  });

  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedCertId, setSelectedCertId] = useState('');

  useEffect(() => {
    localStorage.setItem('certificates', JSON.stringify(certificates));
  }, [certificates]);

  const generateCertificateId = () => {
    return 'CERT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newCertificate: Certificate = {
      id: generateCertificateId(),
      ...formData,
    };

    setCertificates([newCertificate, ...certificates]);

    toast.success('Certificate Issued Successfully!', {
      description: `Certificate ID: ${newCertificate.id}`,
    });

    setFormData({
      recipientName: '',
      courseName: '',
      issueDate: new Date().toISOString().split('T')[0],
      issuer: '',
      description: '',
    });
  };

  const handleShowQR = (certId: string) => {
    setSelectedCertId(certId);
    setShowQRModal(true);
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById('qr-code-svg') as HTMLElement;
    if (!canvas) return;

    const svg = canvas.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `certificate-${selectedCertId}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-blue-100 text-sm">Certificate Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={onGoHome}
                variant="outline"
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button
                onClick={onLogout}
                variant="outline"
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Issue Certificate Form */}
          <Card className="shadow-xl border-blue-100 h-fit">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Plus className="w-5 h-5" />
                Issue New Certificate
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="recipientName" className="text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Recipient Name
                  </Label>
                  <Input
                    id="recipientName"
                    name="recipientName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.recipientName}
                    onChange={handleInputChange}
                    className="border-blue-200 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courseName" className="text-gray-900 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Course / Achievement Name
                  </Label>
                  <Input
                    id="courseName"
                    name="courseName"
                    type="text"
                    placeholder="Web Development Bootcamp"
                    value={formData.courseName}
                    onChange={handleInputChange}
                    className="border-blue-200 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issueDate" className="text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Issue Date
                  </Label>
                  <Input
                    id="issueDate"
                    name="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={handleInputChange}
                    className="border-blue-200 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issuer" className="text-gray-900 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Issuing Organization
                  </Label>
                  <Input
                    id="issuer"
                    name="issuer"
                    type="text"
                    placeholder="Tech Academy Inc."
                    value={formData.issuer}
                    onChange={handleInputChange}
                    className="border-blue-200 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Additional details about the certificate..."
                    value={formData.description}
                    onChange={handleInputChange}
                    className="border-blue-200 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Issue Certificate
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Certificates List */}
          <Card className="shadow-xl border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
              <CardTitle className="text-blue-900">
                Issued Certificates ({certificates.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-auto max-h-[600px]">
                {certificates.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No certificates issued yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {certificates.map((cert) => (
                      <Card key={cert.id} className="border-blue-100 hover:shadow-md transition-shadow">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900">{cert.recipientName}</h4>
                              <p className="text-sm text-gray-600">{cert.courseName}</p>
                            </div>
                            <Button
                              onClick={() => handleShowQR(cert.id)}
                              size="sm"
                              variant="outline"
                              className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            >
                              View QR
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            <Hash className="w-3 h-3" />
                            <span className="font-mono">{cert.id}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>📅 {cert.issueDate}</span>
                            <span>🏢 {cert.issuer}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Certificate QR Code</CardTitle>
                <Button
                  onClick={() => setShowQRModal(false)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <div id="qr-code-svg" className="bg-white p-4 rounded-lg shadow-inner">
                  <QRCodeSVG
                    value={selectedCertId}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Certificate ID</p>
                  <p className="font-mono text-sm font-bold text-gray-900">{selectedCertId}</p>
                </div>
                <div className="flex gap-2 w-full">
                  <Button
                    onClick={handleDownloadQR}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Download QR
                  </Button>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedCertId);
                      toast.success('Certificate ID copied to clipboard!');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Copy ID
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
