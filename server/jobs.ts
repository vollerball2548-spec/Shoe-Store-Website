import { QueueJob } from '../src/types';
import {
  createJob,
  getJob,
  getOrder,
  updateJob,
  updateOrderStatus
} from './repository';

type QueueName = QueueJob['queueName'];
type JobStatus = QueueJob['status'];

const timeLabel = () =>
  new Date().toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

function stageLog(queueName: QueueName, data: Record<string, any>, stage: 'active' | 'progress' | 'done') {
  if (stage === 'active') {
    return `[worker] รับงานจากคิว "${queueName}" เมื่อเวลา ${timeLabel()} กำลังประมวลผล`;
  }
  if (stage === 'done') {
    return `[worker] งานเสร็จสมบูรณ์ ใช้เวลาประมาณ ${(Math.random() * 0.7 + 0.6).toFixed(2)}s`;
  }

  switch (queueName) {
    case 'order-processing':
      return `[inventory] ตรวจสอบสต็อกและล็อกรายการสำหรับออเดอร์ ${data.orderId || '-'} เรียบร้อย`;
    case 'email-notification':
      return `[mailer] ส่งอีเมลแจ้งเตือนไปยัง ${data.email || data.recipient || 'ลูกค้า'} สำเร็จ`;
    case 'inventory-sync':
      return `[sync] ซิงก์สต็อกหลายคลังเรียบร้อย (${data.target || 'ทุกสาขา'})`;
    case 'invoice-generation':
      return `[invoice] สร้างใบกำกับภาษี PDF สำหรับ ${data.orderId || 'คำสั่งซื้อ'} เรียบร้อย`;
    default:
      return '[worker] อัปเดตความคืบหน้าของงาน';
  }
}

function scheduleJob(job: QueueJob, onComplete?: () => void | Promise<void>) {
  const jobId = job.id;
  const queueName = job.queueName;
  const data = job.data || {};
  const baseLogs = [...job.logs];

  setTimeout(async () => {
    try {
      const current = await getJob(jobId);
      if (!current || current.status === 'completed') return;
      await updateJob(jobId, {
        status: 'active',
        progress: 30,
        logs: [...baseLogs, stageLog(queueName, data, 'active')]
      });
    } catch (error) {
      console.warn('[jobs] active stage failed', error);
    }
  }, 500);

  setTimeout(async () => {
    try {
      const current = await getJob(jobId);
      if (!current || current.status === 'completed') return;
      await updateJob(jobId, {
        status: 'active',
        progress: 72,
        logs: [...current.logs, stageLog(queueName, data, 'progress')]
      });
    } catch (error) {
      console.warn('[jobs] progress stage failed', error);
    }
  }, 1400);

  setTimeout(async () => {
    try {
      const current = await getJob(jobId);
      if (!current || current.status === 'completed') return;
      const finishedAt = new Date().toISOString();
      await updateJob(jobId, {
        status: 'completed',
        progress: 100,
        finishedAt,
        logs: [...current.logs, stageLog(queueName, data, 'done')]
      });
      if (onComplete) await onComplete();
    } catch (error) {
      console.warn('[jobs] completion stage failed', error);
      await updateJob(jobId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown worker error',
        logs: [...baseLogs, `[worker] เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'unknown'}`]
      }).catch(() => undefined);
    }
  }, 2400);
}

export async function dispatchJob(
  queueName: QueueName,
  jobName: string,
  data: Record<string, any>,
  onComplete?: () => void | Promise<void>
): Promise<QueueJob> {
  const job = await createJob({ queueName, jobName, data });
  scheduleJob(job, onComplete);
  return job;
}

async function advanceOrder(orderId: string) {
  try {
    const order = await getOrder(orderId);
    if (!order || order.orderStatus !== 'PENDING') return;
    await updateOrderStatus(
      orderId,
      'PROCESSING',
      'Worker ตรวจสอบสต็อกและส่งคำสั่งซื้อเข้าคลังเพื่อจัดเตรียมสินค้าแล้ว'
    );
  } catch (error) {
    console.warn('[jobs] could not advance order', orderId, error);
  }
}

export async function dispatchOrderJobs(order: {
  id: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  items: unknown[];
}) {
  await dispatchJob(
    'order-processing',
    'process-new-order',
    {
      orderId: order.id,
      customer: order.customerName,
      amount: order.totalAmount,
      itemCount: order.items.length
    },
    () => advanceOrder(order.id)
  );

  await dispatchJob('email-notification', 'send-order-confirmation-email', {
    orderId: order.id,
    email: order.customerEmail,
    name: order.customerName,
    total: order.totalAmount
  });

  await dispatchJob('invoice-generation', 'generate-order-invoice', {
    orderId: order.id,
    customer: order.customerName,
    total: order.totalAmount
  });
}

export async function dispatchShippingNotification(order: {
  id: string;
  customerEmail: string;
  trackingNumber?: string;
  carrier?: string;
}) {
  return dispatchJob('email-notification', 'send-shipping-tracking-email', {
    orderId: order.id,
    email: order.customerEmail,
    trackingNumber: order.trackingNumber || '-',
    carrier: order.carrier || '-'
  });
}

export async function retryQueueJob(id: string): Promise<QueueJob> {
  const existing = await getJob(id);
  if (!existing) {
    throw new Error('ไม่พบงานในคิว');
  }

  const status: JobStatus = 'waiting';
  const updated = await updateJob(id, {
    status,
    progress: 0,
    attempts: existing.attempts + 1,
    finishedAt: undefined,
    errorMessage: undefined,
    logs: [
      ...existing.logs,
      `[admin] สั่งรันงานอีกครั้ง (ครั้งที่ ${existing.attempts + 1}/${existing.maxAttempts}) เมื่อเวลา ${timeLabel()}`
    ]
  });

  scheduleJob(updated);
  return updated;
}

export async function triggerInventorySync(adminName: string): Promise<QueueJob> {
  return dispatchJob('inventory-sync', 'manual-warehouse-sync', {
    adminUser: adminName,
    target: 'ทุกคลังสินค้า · 26 SKU',
    requestedAt: new Date().toISOString()
  });
}
