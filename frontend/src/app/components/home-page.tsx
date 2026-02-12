import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Shield, CheckCircle, Lock, QrCode, FileCheck, Zap } from 'lucide-react';

interface HomePageProps {
  onAdminLogin: () => void;
  onGoToVerify: () => void;
}

export default function HomePage({ onAdminLogin, onGoToVerify }: HomePageProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CertiVerify</h1>
                <p className="text-sm text-gray-600">Certificate Verification System</p>
              </div>
            </div>
            <Button
              onClick={onAdminLogin}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Lock className="w-4 h-4 mr-2" />
              Admin Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Verify Certificates Instantly
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Secure, fast, and reliable certificate verification using unique IDs or QR codes. Prevent forgery and ensure authenticity.
          </p>
          <Button
            onClick={onGoToVerify}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-6 shadow-xl"
          >
            <FileCheck className="w-5 h-5 mr-2" />
            Verify Certificate Now
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose CertiVerify?
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="shadow-lg border-blue-100 hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Instant Verification</CardTitle>
              <CardDescription>
                Verify certificates in seconds with unique ID or QR code scanning
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg border-purple-100 hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Secure & Encrypted</CardTitle>
              <CardDescription>
                All certificate data is encrypted and stored securely to prevent tampering
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg border-indigo-100 hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle>Authenticity Guaranteed</CardTitle>
              <CardDescription>
                Prevent certificate forgery with our blockchain-inspired verification system
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 bg-white/50 rounded-3xl my-16">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h3>
        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                1
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Issue Certificate</h4>
              <p className="text-gray-600">
                Organizations issue certificates with unique IDs and QR codes through the admin panel
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                2
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Share Certificate</h4>
              <p className="text-gray-600">
                Recipients receive certificates with QR codes for easy verification
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                3
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Verify Anytime</h4>
              <p className="text-gray-600">
                Anyone can verify the certificate by entering the ID or scanning the QR code
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                4
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Instant Results</h4>
              <p className="text-gray-600">
                Get instant verification results with complete certificate details
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p>© 2026 CertiVerify - Secure Certificate Verification System</p>
      </footer>
    </div>
  );
}
