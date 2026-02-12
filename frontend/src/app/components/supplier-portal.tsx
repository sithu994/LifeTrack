import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Leaf, LogOut, FileText, TrendingUp, Calendar } from 'lucide-react';
import ChatPanel from './chat-panel';

interface MonthlyRecord {
  id: string;
  date: string;
  grossWeight: number;
  deductions: number;
  netWeight: number;
  rate: number;
  amount: number;
}

interface SupplierPortalProps {
  onLogout: () => void;
  supplierId?: string;
}

export default function SupplierPortal({ onLogout, supplierId = 'SUP001' }: SupplierPortalProps) {
  const [selectedMonth, setSelectedMonth] = useState('2026-01');
  
  // Load records from localStorage (shared with staff dashboard)
  const [allEntries, setAllEntries] = useState<MonthlyRecord[]>([]);

  useEffect(() => {
    const savedEntries = localStorage.getItem('teaEntries');
    if (savedEntries) {
      const teaEntries = JSON.parse(savedEntries);
      // Convert tea entries to monthly records with rate and amount
      const monthlyRecords = teaEntries.map((entry: any) => ({
        ...entry,
        rate: 120.0,
        amount: entry.netWeight * 120.0,
      }));
      setAllEntries(monthlyRecords);
    } else {
      // Use mock data if no saved entries
      setAllEntries([
        {
          id: '1',
          date: '2026-01-07',
          grossWeight: 150.5,
          deductions: 5.2,
          netWeight: 145.3,
          rate: 120.0,
          amount: 17436.0,
        },
        {
          id: '2',
          date: '2026-01-06',
          grossWeight: 200.0,
          deductions: 8.5,
          netWeight: 191.5,
          rate: 120.0,
          amount: 22980.0,
        },
        {
          id: '3',
          date: '2026-01-05',
          grossWeight: 160.2,
          deductions: 4.8,
          netWeight: 155.4,
          rate: 120.0,
          amount: 18648.0,
        },
        {
          id: '4',
          date: '2026-01-04',
          grossWeight: 175.8,
          deductions: 6.3,
          netWeight: 169.5,
          rate: 120.0,
          amount: 20340.0,
        },
        {
          id: '5',
          date: '2026-01-03',
          grossWeight: 185.0,
          deductions: 7.0,
          netWeight: 178.0,
          rate: 120.0,
          amount: 21360.0,
        },
        {
          id: '6',
          date: '2026-01-02',
          grossWeight: 165.5,
          deductions: 5.5,
          netWeight: 160.0,
          rate: 120.0,
          amount: 19200.0,
        },
        {
          id: '7',
          date: '2026-01-01',
          grossWeight: 155.2,
          deductions: 4.2,
          netWeight: 151.0,
          rate: 120.0,
          amount: 18120.0,
        },
      ]);
    }
  }, []);

  // Filter records by selected month
  const monthlyRecords = allEntries.filter((record) => 
    record.date.startsWith(selectedMonth)
  );

  // Calculate totals
  const totalGrossWeight = monthlyRecords.reduce((sum, record) => sum + record.grossWeight, 0);
  const totalDeductions = monthlyRecords.reduce((sum, record) => sum + record.deductions, 0);
  const totalNetWeight = monthlyRecords.reduce((sum, record) => sum + record.netWeight, 0);
  const totalAmount = monthlyRecords.reduce((sum, record) => sum + record.amount, 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Supplier Portal</h1>
                <p className="text-green-100 text-sm">සැපයුම්කරු පෝටලය</p>
              </div>
            </div>
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
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg border-green-100 bg-gradient-to-br from-white to-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 mb-1">Total Net Weight</p>
                  <p className="text-xs text-green-600 mb-2">මුළු ශුද්ධ බර</p>
                  <p className="text-3xl font-bold text-green-900">{totalNetWeight.toFixed(1)}</p>
                  <p className="text-sm text-green-700">kg</p>
                </div>
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-green-100 bg-gradient-to-br from-white to-emerald-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-700 mb-1">Total Deliveries</p>
                  <p className="text-xs text-emerald-600 mb-2">මුළු බෙදාහැරීම්</p>
                  <p className="text-3xl font-bold text-emerald-900">{monthlyRecords.length}</p>
                  <p className="text-sm text-emerald-700">entries</p>
                </div>
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                  <FileText className="w-7 h-7 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-green-100 bg-gradient-to-br from-white to-teal-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-teal-700 mb-1">Total Amount</p>
                  <p className="text-xs text-teal-600 mb-2">මුළු මුදල</p>
                  <p className="text-3xl font-bold text-teal-900">
                    {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-teal-700">LKR</p>
                </div>
                <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-teal-600">₨</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Tea Report */}
        <Card className="shadow-xl border-green-100">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-green-900">
                <FileText className="w-5 h-5" />
                Monthly Tea Report | මාසික තේ වාර්තාව
              </CardTitle>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-700" />
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-40 border-green-200 focus:border-green-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026-01">January 2026</SelectItem>
                    <SelectItem value="2025-12">December 2025</SelectItem>
                    <SelectItem value="2025-11">November 2025</SelectItem>
                    <SelectItem value="2025-10">October 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-auto max-h-[500px]">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow className="bg-green-50 hover:bg-green-50">
                    <TableHead className="text-green-900">Date<br/>දිනය</TableHead>
                    <TableHead className="text-green-900 text-right">Gross Weight (kg)<br/>දළ බර</TableHead>
                    <TableHead className="text-green-900 text-right">Deductions (kg)<br/>අඩු කිරීම්</TableHead>
                    <TableHead className="text-green-900 text-right">Net Weight (kg)<br/>ශුද්ධ බර</TableHead>
                    <TableHead className="text-green-900 text-right">Rate (LKR/kg)<br/>අනුපාතය</TableHead>
                    <TableHead className="text-green-900 text-right">Amount (LKR)<br/>මුදල</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-green-50/50">
                      <TableCell className="font-medium">{record.date}</TableCell>
                      <TableCell className="text-right">{record.grossWeight.toFixed(1)}</TableCell>
                      <TableCell className="text-right text-red-600">{record.deductions.toFixed(1)}</TableCell>
                      <TableCell className="text-right font-semibold text-green-700">
                        {record.netWeight.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right">{record.rate.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {record.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Summary Section */}
            <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 p-6 shadow-md">
              <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Monthly Summary | මාසික සාරාංශය
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
                  <p className="text-sm text-green-700 mb-1">Total Gross Weight</p>
                  <p className="text-xs text-green-600 mb-2">මුළු දළ බර</p>
                  <p className="text-2xl font-bold text-green-900">{totalGrossWeight.toFixed(1)} kg</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-red-100">
                  <p className="text-sm text-red-700 mb-1">Total Deductions</p>
                  <p className="text-xs text-red-600 mb-2">මුළු අඩු කිරීම්</p>
                  <p className="text-2xl font-bold text-red-900">{totalDeductions.toFixed(1)} kg</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
                  <p className="text-sm text-green-700 mb-1">Total Net Weight</p>
                  <p className="text-xs text-green-600 mb-2">මුළු ශුද්ධ බර</p>
                  <p className="text-2xl font-bold text-green-900">{totalNetWeight.toFixed(1)} kg</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-teal-100">
                  <p className="text-sm text-teal-700 mb-1">Total Amount</p>
                  <p className="text-xs text-teal-600 mb-2">මුළු මුදල</p>
                  <p className="text-2xl font-bold text-teal-900">
                    ₨ {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Panel */}
      <ChatPanel userRole="supplier" userName={`Supplier ${supplierId}`} supplierId={supplierId} />
    </div>
  );
}