import React from 'react';
import type { DriverLogData, RemarkEntry, DutyStatus } from './types';
import { format12Hour } from './utils/timeToPixels';
import { MapPin, FileText, Trash2, Plus } from 'lucide-react';

interface RemarksProps {
  data: DriverLogData;
  onChange: (updates: Partial<DriverLogData>) => void;
}

export const Remarks: React.FC<RemarksProps> = ({ data, onChange }) => {
  // Handle change in shipping/commodity inputs
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  // Update a specific remark
  const handleRemarkChange = (id: string, field: keyof RemarkEntry, value: string) => {
    const updatedRemarks = data.remarks.map((r) => {
      if (r.id === id) {
        return { ...r, [field]: value };
      }
      return r;
    });
    onChange({ remarks: updatedRemarks });
  };

  // Delete a remark
  const handleDeleteRemark = (id: string) => {
    const updatedRemarks = data.remarks.filter((r) => r.id !== id);
    onChange({ remarks: updatedRemarks });
  };

  // Add a manual remark
  const handleAddRemark = () => {
    const newRemark: RemarkEntry = {
      id: Math.random().toString(36).substring(2, 9),
      time: '12:00',
      status: 'ON_DUTY',
      location: '',
      text: '',
    };
    // Sort remarks chronologically after adding
    const updated = [...data.remarks, newRemark].sort((a, b) => {
      return a.time.localeCompare(b.time);
    });
    onChange({ remarks: updated });
  };



  return (
    <div className="w-full border-x-2 border-b-2 border-slate-900 bg-white grid grid-cols-1 md:grid-cols-12 text-xs font-semibold text-slate-800">
      
      {/* Left Column: Location & Duty Status Remarks (9 Columns) */}
      <div className="col-span-1 md:col-span-8 p-4 border-b md:border-b-0 md:border-r border-slate-300 flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-3">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Remarks (Location & Status Changes)
            </h2>
          </div>
          <button
            onClick={handleAddRemark}
            className="no-print flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[10px] font-bold text-slate-700 cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Remark</span>
          </button>
        </div>

        {data.remarks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-6 text-slate-400 font-medium">
            <p>No remarks recorded for today.</p>
            <p className="text-[10px] text-slate-300 mt-1">Remarks will generate automatically for status changes or can be added manually.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-[10px] uppercase text-slate-500 font-black text-left">
                  <th className="py-1 px-2 w-20">Time</th>
                  <th className="py-1 px-2 w-24">Status</th>
                  <th className="py-1 px-2">City, State (Where status changed)</th>
                  <th className="py-1 px-2">Remarks / Details</th>
                  <th className="py-1 px-2 w-10 text-center no-print"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.remarks.map((remark) => (
                  <tr key={remark.id} className="hover:bg-slate-50 transition-colors">
                    {/* Time Input */}
                    <td className="py-1.5 px-2 font-mono">
                      <input
                        type="text"
                        value={remark.time}
                        onChange={(e) => handleRemarkChange(remark.id, 'time', e.target.value)}
                        placeholder="08:00"
                        className="w-16 border-b border-transparent hover:border-slate-300 focus:border-slate-900 bg-transparent focus:outline-none font-bold"
                      />
                      <span className="text-[9px] text-slate-400 block mt-0.5">
                        ({format12Hour(remark.time)})
                      </span>
                    </td>
                    
                    {/* Status Dropdown */}
                    <td className="py-1.5 px-2">
                      <select
                        value={remark.status}
                        onChange={(e) => handleRemarkChange(remark.id, 'status', e.target.value as DutyStatus)}
                        className="bg-transparent hover:bg-slate-100 rounded p-1 border-none font-bold focus:outline-none text-[11px] text-slate-800 cursor-pointer"
                      >
                        <option value="OFF_DUTY">Off Duty</option>
                        <option value="SLEEPER">Sleeper</option>
                        <option value="DRIVING">Driving</option>
                        <option value="ON_DUTY">On Duty</option>
                      </select>
                    </td>
                    
                    {/* Location Field */}
                    <td className="py-1.5 px-2">
                      <input
                        type="text"
                        value={remark.location}
                        onChange={(e) => handleRemarkChange(remark.id, 'location', e.target.value)}
                        placeholder="e.g. Detroit, MI"
                        className="w-full border-b border-transparent hover:border-slate-300 focus:border-slate-950 bg-transparent focus:outline-none font-mono font-medium"
                      />
                    </td>
                    
                    {/* Remark notes */}
                    <td className="py-1.5 px-2">
                      <input
                        type="text"
                        value={remark.text}
                        onChange={(e) => handleRemarkChange(remark.id, 'text', e.target.value)}
                        placeholder="e.g. Fueling / Pre-Trip"
                        className="w-full border-b border-transparent hover:border-slate-300 focus:border-slate-950 bg-transparent focus:outline-none font-mono font-medium"
                      />
                    </td>
                    
                    {/* Delete Action button */}
                    <td className="py-1.5 px-2 text-center no-print">
                      <button
                        onClick={() => handleDeleteRemark(remark.id)}
                        className="text-slate-400 hover:text-red-500 cursor-pointer transition-colors p-1 rounded hover:bg-slate-100"
                        title="Delete Remark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Right Column: Cargo Details & Shipper Info (4 Columns) */}
      <div className="col-span-1 md:col-span-4 p-4 flex flex-col gap-4">
        <div className="flex items-center gap-1.5 border-b border-slate-300 pb-2">
          <FileText className="w-4 h-4 text-slate-700" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Cargo & Shipping Info
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col">
            <input
              type="text"
              name="shippingDocs"
              value={data.shippingDocs}
              onChange={handleFieldChange}
              placeholder="e.g. B/L 9876543-A"
              className="border-b border-slate-400 font-mono text-sm py-1 focus:outline-none focus:border-slate-900 bg-transparent placeholder-slate-300"
            />
            <span className="text-[9px] text-slate-500 uppercase mt-0.5 font-bold">
              Shipping Documents (B/L, Manifest No.)
            </span>
          </div>

          <div className="flex flex-col">
            <input
              type="text"
              name="shipper"
              value={data.shipper}
              onChange={handleFieldChange}
              placeholder="e.g. Steel Logistics Inc."
              className="border-b border-slate-400 font-mono text-sm py-1 focus:outline-none focus:border-slate-900 bg-transparent placeholder-slate-300"
            />
            <span className="text-[9px] text-slate-500 uppercase mt-0.5 font-bold">
              Shipper / Cargo Origin
            </span>
          </div>

          <div className="flex flex-col">
            <input
              type="text"
              name="commodity"
              value={data.commodity}
              onChange={handleFieldChange}
              placeholder="e.g. Structural Steel"
              className="border-b border-slate-400 font-mono text-sm py-1 focus:outline-none focus:border-slate-900 bg-transparent placeholder-slate-300"
            />
            <span className="text-[9px] text-slate-500 uppercase mt-0.5 font-bold">
              Commodity / Cargo Type
            </span>
          </div>

        </div>

        {/* Informational note for standard logs */}
        <div className="mt-auto bg-slate-50 p-2.5 rounded border border-slate-200 text-[10px] text-slate-500 font-medium no-print leading-relaxed">
          <strong>Regulations Note:</strong> Keep logs and supporting documents for 6 months. Inaccurate logs can result in civil/criminal penalties.
        </div>
      </div>
      
    </div>
  );
};
