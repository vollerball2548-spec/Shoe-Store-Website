import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Play, 
  Terminal, 
  Cpu, 
  Server, 
  Layers, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { QueueJob } from '../types';

interface QueueMonitorViewProps {
  onTriggerSync: () => void;
  onRetryJob: (jobId: string) => void;
}

export const QueueMonitorView: React.FC<QueueMonitorViewProps> = ({
  onTriggerSync,
  onRetryJob
}) => {
  const [jobs, setJobs] = useState<QueueJob[]>([]);
  const [metrics, setMetrics] = useState({ waiting: 0, active: 0, completed: 0, failed: 0 });
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchJobs = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/queue/jobs');
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs);
        setMetrics(data.metrics);
        if (!selectedJobId && data.jobs.length > 0) {
          setSelectedJobId(data.jobs[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 2500);
    return () => clearInterval(interval);
  }, []);

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-sky-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">BullMQ Redis Background Queue Monitor</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-sky-400 border border-blue-500/30">
                  LIVE WORKER POOL
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                ระบบจัดการงาน Asynchronous Background Jobs แยกอิสระจาก HTTP Request เพื่อความรวดเร็วของ API
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchJobs}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
            <span>รีเฟรช Queue</span>
          </button>

          <button
            onClick={onTriggerSync}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>สั่งงาน Inventory Sync Job</span>
          </button>
        </div>
      </div>

      {/* Queue Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-bold uppercase">Active Processing</span>
            <Activity className="w-4 h-4 text-sky-400 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-sky-400">{metrics.active}</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">กำลังประมวลผลบน Worker Thread</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-bold uppercase">Waiting in Queue</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{metrics.waiting}</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">รอคิวใน Redis Broker</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-bold uppercase">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-blue-400">{metrics.completed}</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">ประมวลผลเสร็จสิ้นสำเร็จ</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-bold uppercase">Failed / Retries</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400">{metrics.failed}</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">Auto-retry exponential backoff</p>
        </div>
      </div>

      {/* Main Split View: Job List & Terminal Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
        {/* Left: Job Cards List (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>รายการ Background Jobs ใน Redis ({jobs.length})</span>
          </h3>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {jobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-900 border-sky-500 shadow-xl shadow-sky-950/30'
                      : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-white">{job.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {job.queueName}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          job.status === 'completed' ? 'bg-blue-500/20 text-sky-400' :
                          job.status === 'active' ? 'bg-sky-500/20 text-sky-400 animate-pulse' :
                          job.status === 'waiting' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-rose-500/20 text-rose-400'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-zinc-200 mt-1">{job.jobName}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-zinc-500 block">
                        {new Date(job.createdAt).toLocaleTimeString('th-TH')}
                      </span>
                      {job.status === 'failed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRetryJob(job.id);
                          }}
                          className="mt-1 text-[11px] text-sky-400 hover:underline flex items-center gap-1 font-bold"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Retry</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                      <span>Progress</span>
                      <span>{job.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          job.status === 'completed' ? 'bg-sky-400' :
                          job.status === 'active' ? 'bg-blue-500' :
                          'bg-amber-400'
                        }`}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Job Terminal Inspector (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sticky top-20 shadow-2xl flex flex-col h-full max-h-[600px]">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Worker Live Terminal Log
                </h4>
              </div>
              {selectedJob && (
                <span className="font-mono text-[11px] text-sky-400">{selectedJob.id}</span>
              )}
            </div>

            {selectedJob ? (
              <div className="space-y-3 flex-1 overflow-y-auto">
                {/* Payload parameters */}
                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/80">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Job Payload (JSON Data)
                  </span>
                  <pre className="text-[11px] font-mono text-sky-300 overflow-x-auto">
                    {JSON.stringify(selectedJob.data, null, 2)}
                  </pre>
                </div>

                {/* Terminal logs list */}
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1 font-mono text-[11px]">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Execution Logs Stream
                  </span>
                  {selectedJob.logs.map((log, idx) => (
                    <div key={idx} className="text-zinc-300 leading-relaxed">
                      <span className="text-sky-400 mr-1">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-zinc-500 text-xs">
                เลือก Job เพื่อดูบันทึกการทำงานของ Worker
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
