import React from 'react';
import { X, ShieldCheck, Download, Award, CheckCircle2, FileText, Check } from 'lucide-react';

interface LabReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LabReportModal: React.FC<LabReportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const parameters = [
    { name: 'Argemone Oil Test', result: 'Negative', limit: 'Must be Absent', status: 'PASS' },
    { name: 'Acid Value (FFA as Oleic)', result: '0.38 mg KOH/g', limit: 'Max 4.0 mg KOH/g', status: 'PASS' },
    { name: 'Moisture & Volatile Matter', result: '0.12%', limit: 'Max 0.25%', status: 'PASS' },
    { name: 'Saponification Value', result: '174', limit: '168 - 177', status: 'PASS' },
    { name: 'Iodine Value (Wijs)', result: '104', limit: '98 - 110', status: 'PASS' },
    { name: 'Natural Allyl Isothiocyanate', result: '0.34%', limit: 'Min 0.20%', status: 'PASS' },
    { name: 'Mineral Oil / Synthetic Hydrocarbons', result: 'Not Detected', limit: 'Must be Absent', status: 'PASS' },
    { name: 'Hexane Solvent Residue', result: '0.00 ppm (Zero)', limit: 'Must be Absent', status: 'PASS' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-emerald-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-widest mb-1">
            <Award className="w-4 h-4" />
            <span>Official Government Certified Analysis</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-serif-heading">
            Quality & Purity Certification Report
          </h3>
          <p className="text-xs text-emerald-200 mt-1">
            Arsh Agro Industry • Mill Campus, Hathaura, Siwan, Bihar - 841237
          </p>
        </div>

        {/* Certificate Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* FSSAI Badge Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-900 uppercase">Food Safety & Standards Authority of India</p>
                <p className="text-sm font-extrabold text-stone-900">FSSAI Lic. No: 10423000001289</p>
                <p className="text-[11px] text-emerald-800">PGS-India Certified Organic Processor Standard</p>
              </div>
            </div>
            <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shrink-0 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> 100% Certified
            </span>
          </div>

          {/* Test parameters table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-extrabold text-stone-900">
                Batch Analysis Parameters (Cold-Pressed Mustard Oil)
              </h4>
              <span className="text-[11px] font-semibold text-stone-500">
                Batch: AAG-2026/SWN-09
              </span>
            </div>

            <div className="border border-stone-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-4 font-bold text-stone-700">Parameter Tested</th>
                    <th className="py-2.5 px-3 font-bold text-stone-700">Result</th>
                    <th className="py-2.5 px-3 font-bold text-stone-500 hidden sm:table-cell">Standard Limit</th>
                    <th className="py-2.5 px-3 font-bold text-stone-700 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {parameters.map((item, idx) => (
                    <tr key={idx} className="hover:bg-amber-50/20">
                      <td className="py-2.5 px-4 font-medium text-stone-900">{item.name}</td>
                      <td className="py-2.5 px-3 font-bold text-amber-900">{item.result}</td>
                      <td className="py-2.5 px-3 text-stone-500 hidden sm:table-cell">{item.limit}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3" /> {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statement */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 leading-relaxed">
            <p className="font-bold text-stone-800 mb-1">Chief Quality Controller Statement:</p>
            "The tested sample of ArshSarso Mustard Oil has been produced via mechanical cold extraction under 45°C and 48-hour gravity settling. The product meets all requirements of the Food Safety and Standards (Food Products Standards and Food Additives) Regulations with zero adulteration."
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
          <span className="text-xs text-stone-500">Seal of Arsh Agro Industry, Siwan</span>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>

      </div>
    </div>
  );
};
