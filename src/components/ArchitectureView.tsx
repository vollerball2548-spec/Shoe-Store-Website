import React, { useState } from 'react';
import { 
  Layers, 
  Code2, 
  Database, 
  Cpu, 
  Container, 
  Copy, 
  Check, 
  FileText, 
  Server, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Terminal,
  BookOpen
} from 'lucide-react';
import { ARCHITECTURE_FILES, ArchitectureFile } from '../data/architectureFiles';

export const ArchitectureView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ArchitectureFile>(ARCHITECTURE_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-sky-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">Full-Stack Architecture & Source Code Hub</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-sky-400 border border-blue-500/30">
                  PRODUCTION READY
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                สถาปัตยกรรมระดับ Production: React 19 + NestJS + MySQL + BullMQ + Docker Compose
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Architecture Flow Diagram */}
      <div className="mt-8 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl">
        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-6 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sky-400" />
          <span>แผนผังการไหลของข้อมูลในระบบ (System Data Flow Architecture)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {/* Box 1: React Frontend */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-sky-500/40 text-center relative group">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 text-sky-400 flex items-center justify-center mx-auto mb-2">
              <Code2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-sky-400 uppercase block">Level 1: Client</span>
            <h4 className="text-xs font-extrabold text-white mt-0.5">React 19 + TypeScript</h4>
            <p className="text-[11px] text-zinc-400 mt-1">Tailwind CSS, Sizing Selector, Cart & Checkout</p>
          </div>

          {/* Box 2: NestJS REST API */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-sky-500/40 text-center relative group">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto mb-2">
              <Server className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-sky-400 uppercase block">Level 1: Backend</span>
            <h4 className="text-xs font-extrabold text-white mt-0.5">NestJS REST API</h4>
            <p className="text-[11px] text-zinc-400 mt-1">ValidationPipe, Swagger OpenAPI & JWT Guards</p>
          </div>

          {/* Box 3: MySQL 8.0 */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/40 text-center relative group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-2">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-amber-400 uppercase block">Level 1: Persistence</span>
            <h4 className="text-xs font-extrabold text-white mt-0.5">MySQL 8.0 + TypeORM</h4>
            <p className="text-[11px] text-zinc-400 mt-1">Relational schema, Pessimistic stock locks</p>
          </div>

          {/* Box 4: BullMQ + Redis */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-rose-500/40 text-center relative group">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-2">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-rose-400 uppercase block">Level 3: Async Queue</span>
            <h4 className="text-xs font-extrabold text-white mt-0.5">BullMQ + Redis</h4>
            <p className="text-[11px] text-zinc-400 mt-1">Async order processing & SMTP receipt emails</p>
          </div>

          {/* Box 5: Docker Compose */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-indigo-500/40 text-center relative group">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-2">
              <Container className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase block">Level 2: DevOps</span>
            <h4 className="text-xs font-extrabold text-white mt-0.5">Docker Compose</h4>
            <p className="text-[11px] text-zinc-400 mt-1">Multi-container 1-command startup</p>
          </div>
        </div>
      </div>

      {/* Technical Highlights / Interview Speaking Points */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>1. การป้องกัน Stock แย่งกัน (Race Conditions)</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            ใช้ **Pessimistic Write Lock (`pessimistic_write`)** ร่วมกับ Database Transaction บน TypeORM เพื่อล็อกแถวสต็อกรองเท้าไซส์นั้น ๆ ขณะ Checkout ป้องกันการขายสินค้าเกินจำนวนสต็อกจริง (Zero Overselling)
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-2">
            <Zap className="w-4 h-4" />
            <span>2. Background Jobs ด้วย BullMQ</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            แยกงานที่ใช้เวลานาน เช่น การส่งอีเมลใบเสร็จ (SMTP) และการตัดสต็อกข้ามสาขา ออกไปเป็น Job คิวใน Redis ทำให้ Endpoint `POST /api/orders` ตอบกลับลูกค้าได้เร็วในระดับหลักมิลลิวินาที
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs mb-2">
            <Container className="w-4 h-4" />
            <span>3. Multi-Container Dockerization</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            มี `docker-compose.yml` รวม 4 Services (Frontend, Backend, MySQL, Redis) พร้อม Healthcheck ทำให้ทีมสามารถรันโปรเจกต์ได้ทันทีด้วยคำสั่งเดียว `docker-compose up -d`
          </p>
        </div>
      </div>

      {/* Interactive Code & Architecture File Explorer */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: File List (4 Cols) */}
        <div className="lg:col-span-4 space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>เลือกไฟล์ Source Code (Files Explorer)</span>
          </h3>

          <div className="space-y-1.5">
            {ARCHITECTURE_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;

              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-zinc-900 border-sky-500 shadow-xl shadow-sky-950/30'
                      : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white truncate">{file.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      file.language === 'typescript' ? 'bg-sky-500/20 text-sky-400' :
                      file.language === 'sql' ? 'bg-amber-500/20 text-amber-400' :
                      file.language === 'yaml' ? 'bg-indigo-500/20 text-indigo-400' :
                      'bg-blue-500/20 text-sky-400'
                    }`}>
                      {file.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 truncate font-mono">{file.path}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Code Display (8 Cols) */}
        <div className="lg:col-span-8">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            {/* Code Box Header */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-white block">{selectedFile.path}</span>
                <p className="text-[11px] text-zinc-400 mt-0.5">{selectedFile.description}</p>
              </div>

              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-sky-400">คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <div className="p-5 overflow-x-auto max-h-[550px] bg-zinc-950 font-mono text-xs text-zinc-200 leading-relaxed">
              <pre>
                <code>{selectedFile.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
