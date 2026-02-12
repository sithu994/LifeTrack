import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Shield, Home, Search, CheckCircle, XCircle, QrCode, User, Award, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface Certificate {
  id: string;
  recipientName: string;
  courseName: string;
  issueDate: string;
  issuer: string;
  description: string;
}

interface VerifyPageProps {
  onGoHome: () => void;
}

export default function VerifyPage({ onGoHome }: VerifyPageProps) {
  const [certificateId, setCertificateId] = useState('');
  const [verificationResult, setVerificationResult] = useState<'idle' | 'verified' | 'not-found'>('idle');
  const [verifiedCertificate, setVerifiedCertificate] = useState<Certificate | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();

    if (!certificateId.trim()) {
      toast.error('Please enter a certificate ID');
      return;
    }

    // Load certificates from localStorage
    const savedCertificates = localStorage.getItem('certificates');
    if (!savedCertificates) {
      setVerificationResult('not-found');
      setVerifiedCertificate(null);
      return;
    }

    const certificates: Certificate[] = JSON.parse(savedCertificates);
    const foundCertificate = certificates.find(cert => cert.id.toLowerCase() === certificateId.trim().toLowerCase());

    if (foundCertificate) {
      setVerificationResult('verified');
      setVerifiedCertificate(foundCertificate);
      toast.success('Certificate Verified Successfully!');
    } else {
      setVerificationResult('not-found');
      setVerifiedCertificate(null);
      toast.error('Certificate Not Found');
    }
  };

  const handleReset = () => {
    setCertificateId('');
    setVerificationResult('idle');
    setVerifiedCertificate(null);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Verify Certificate</h1>
                <p className="text-sm text-gray-600">Enter ID or Scan QR Code</p>
              </div>
            </div>
            <Button
              onClick={onGoHome}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Verification Form */}
          <Card className="shadow-2xl border-blue-100 mb-8">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Search className="w-5 h-5" />
                Certificate Verification
              </CardTitle>
              <CardDescription>
                Enter the certificate ID to verify its authenticity
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleVerify} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="certificateId" className="text-gray-900 flex items-center gap-2">
                    <QrCode className="w-4 h-4" />
                    Certificate ID
                  </Label>
                  <Input
                    id="certificateId"
                    type="text"
                    placeholder="CERT-XXXXXXXXXX"
                    value={certificateId}
                    onChange={(e) => setCertificateId(e.target.value)}
                    className="border-blue-200 focus:border-blue-500 text-lg font-mono"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Enter the unique certificate ID found on your certificate or scan the QR code
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Verify Certificate
                  </Button>
                  {verificationResult !== 'idle' && (
                    <Button
                      type="button"
                      onClick={handleReset}
                      variant="outline"
                      className="border-gray-300"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Verification Result - Success */}
          {verificationResult === 'verified' && verifiedCertificate && (
            <Card className="shadow-2xl border-green-200 animate-in fade-in duration-500">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-green-900">Certificate Verified ✓</CardTitle>
                    <CardDescription className="text-green-700">
                      This certificate is authentic and valid
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{verifiedCertificate.courseName}</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Awarded to</p>
                          <p className="font-semibold text-gray-900 text-lg">{verifiedCertificate.recipientName}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Issue Date</p>
                          <p className="font-semibold text-gray-900">{verifiedCertificate.issueDate}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Issued by</p>
                          <p className="font-semibold text-gray-900">{verifiedCertificate.issuer}</p>
                        </div>
                      </div>
                      {verifiedCertificate.description && (
                        <div className="flex items-start gap-3">
                          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600">Description</p>
                            <p className="text-gray-900">{verifiedCertificate.description}</p>
                          </div>
                        </div>
                      )}
                      <div className="pt-3 border-t border-blue-200">
                        <p className="text-xs text-gray-600 mb-1">Certificate ID</p>
                        <p className="font-mono text-sm font-bold text-blue-900">{verifiedCertificate.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-900 mb-1">Authenticity Verified</p>
                        <p className="text-sm text-green-700">
                          This certificate has been verified against our secure database. The information displayed above matches our records.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verification Result - Not Found */}
          {verificationResult === 'not-found' && (
            <Card className="shadow-2xl border-red-200 animate-in fade-in duration-500">
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-7 h-7 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-red-900">Certificate Not Found</CardTitle>
                    <CardDescription className="text-red-700">
                      Unable to verify this certificate
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-6 h-6 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900 mb-2">Verification Failed</p>
                      <p className="text-sm text-red-700 mb-4">
                        The certificate ID you entered does not match any records in our database. This could mean:
                      </p>
                      <ul className="list-disc list-inside text-sm text-red-700 space-y-1 ml-4">
                        <li>The certificate ID is incorrect or mistyped</li>
                        <li>The certificate has not been issued through this system</li>
                        <li>The certificate may be fraudulent</li>
                      </ul>
                      <p className="text-sm text-red-700 mt-4">
                        Please double-check the certificate ID and try again. If you believe this is an error, contact the issuing organization.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          {verificationResult === 'idle' && (
            <Card className="shadow-lg border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">How to Verify</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-3 text-gray-700">
                  <li>Locate the certificate ID on your certificate document</li>
                  <li>Enter the complete certificate ID in the field above</li>
                  <li>Click "Verify Certificate" to check authenticity</li>
                  <li>If valid, you'll see the complete certificate details</li>
                </ol>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> Certificate IDs are case-insensitive and usually start with "CERT-"
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
