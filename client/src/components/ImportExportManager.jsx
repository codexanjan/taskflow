import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, Printer, Info, HelpCircle } from 'lucide-react';
import { tasksAPI } from '../utils/api';

export default function ImportExportManager({ tasks, onTaskImported, guestMode }) {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Export Tasks to CSV
  const handleExportCSV = () => {
    if (tasks.length === 0) return;
    
    const headers = ['Title', 'Description', 'Priority', 'Category', 'Due Date', 'Completed', 'Status', 'Recurrence', 'Created At'];
    const rows = tasks.map((t) => [
      t.title,
      t.description || '',
      t.priority,
      t.category,
      t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
      t.completed ? 'Yes' : 'No',
      t.status || 'To Do',
      t.recurrence || 'none',
      new Date(t.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
      + [headers.join(','), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `taskflow_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger Print View (PDF)
  const handleExportPDF = () => {
    window.print();
  };

  // Download Sample Import Template
  const handleDownloadTemplate = () => {
    const headers = ['Title', 'Description', 'Priority', 'Category', 'Due Date (YYYY-MM-DD)', 'Recurrence', 'Status'];
    const sampleRow = ['Sample Task', 'This is a description', 'High', 'Work', new Date().toISOString().split('T')[0], 'none', 'To Do'];
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), sampleRow.join(',')].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'taskflow_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle CSV file upload & parsing
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setImporting(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        
        if (lines.length < 2) {
          throw new Error('CSV file is empty or missing headers');
        }

        // Header mapping
        const headers = lines[0].split(',').map(h => h.trim().replace(/^["\uFEFF]+|["\uFEFF]+$/g, ''));
        const titleIdx = headers.findIndex(h => h.toLowerCase().includes('title'));
        const descIdx = headers.findIndex(h => h.toLowerCase().includes('description') || h.toLowerCase() === 'desc');
        const priorityIdx = headers.findIndex(h => h.toLowerCase().includes('priority'));
        const categoryIdx = headers.findIndex(h => h.toLowerCase().includes('category'));
        const dateIdx = headers.findIndex(h => h.toLowerCase().includes('due date'));
        const recurrenceIdx = headers.findIndex(h => h.toLowerCase().includes('recurrence'));
        const statusIdx = headers.findIndex(h => h.toLowerCase().includes('status'));

        if (titleIdx === -1) {
          throw new Error('CSV must contain a "Title" column');
        }

        let importedCount = 0;

        // Parse remaining lines
        for (let i = 1; i < lines.length; i++) {
          const row = parseCSVRow(lines[i]);
          if (!row || row.length === 0 || !row[titleIdx]) continue;

          const taskData = {
            title: row[titleIdx],
            description: descIdx !== -1 ? row[descIdx] : '',
            priority: priorityIdx !== -1 && ['High', 'Medium', 'Low'].includes(row[priorityIdx]) ? row[priorityIdx] : 'Medium',
            category: categoryIdx !== -1 ? row[categoryIdx] : 'Work',
            dueDate: dateIdx !== -1 && row[dateIdx] ? new Date(row[dateIdx]).toISOString() : null,
            recurrence: recurrenceIdx !== -1 ? row[recurrenceIdx] : 'none',
            status: statusIdx !== -1 ? row[statusIdx] : 'To Do',
          };

          await tasksAPI.create(taskData, guestMode);
          importedCount++;
        }

        setSuccess(`Successfully imported ${importedCount} tasks!`);
        if (onTaskImported) onTaskImported();
      } catch (err) {
        setError(err.message || 'Failed to parse CSV file');
      } finally {
        setImporting(false);
        // Clear input
        e.target.value = '';
      }
    };

    reader.readAsText(file);
  };

  // Helper to correctly parse CSV values containing quotes/commas
  const parseCSVRow = (text) => {
    let p = '', row = [''], q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (q && text[i+1] === '"') { row[row.length-1] += c; i++; }
        else { q = !q; }
      } else if (c === ',') {
        if (q) { row[row.length-1] += c; }
        else { row.push(''); }
      } else {
        row[row.length-1] += c;
      }
    }
    return row.map(v => v.trim());
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/20 dark:border-slate-800/30 shadow-xl space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-850/50">
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
          <FileSpreadsheet className="w-4.5 h-4.5 text-indigo-500" />
          <span>Import / Export Data</span>
        </h4>
        <button
          onClick={handleDownloadTemplate}
          className="text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Get CSV Template</span>
        </button>
      </div>

      {/* Info Warning */}
      <div className="p-3 bg-indigo-550/5 border border-indigo-500/10 rounded-2xl flex items-start gap-2.5 text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          Importing tasks merges records directly into your active dashboard. Verify column formats conform to the CSV template schema.
        </div>
      </div>

      {/* Banners */}
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          {success}
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CSV Import */}
        <div className="p-4 bg-slate-100/30 dark:bg-slate-900/10 rounded-2xl border border-slate-200/50 dark:border-slate-800/20 flex flex-col items-center justify-center space-y-3 py-6 relative">
          {importing ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-indigo-650 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Parsing...</span>
            </div>
          ) : (
            <>
              <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Import CSV Tasks</span>
                <span className="text-[9px] text-slate-450 dark:text-slate-500">Choose a compatible CSV file</span>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </>
          )}
        </div>

        {/* Exports panel */}
        <div className="flex flex-col gap-3 justify-center">
          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            disabled={tasks.length === 0}
            className="w-full py-3 px-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/20 dark:bg-slate-900/10 hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-45"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            <span>Export to Excel (CSV)</span>
          </button>

          {/* PDF Export */}
          <button
            onClick={handleExportPDF}
            disabled={tasks.length === 0}
            className="w-full py-3 px-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/20 dark:bg-slate-900/10 hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-45"
          >
            <Printer className="w-4 h-4 text-indigo-500" />
            <span>Print List / Save PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
}
