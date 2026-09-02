'use client';

import { useMemo, useRef, useState } from 'react';
import { Download, FileCheck2, Plus, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type Item = { name: string; spec: string; unit: string; qty: number; price: number; note: string };
const blankItem = (): Item => ({ name: '', spec: '', unit: '', qty: 1, price: 0, note: '' });
const money = (n: number) => new Intl.NumberFormat('zh-TW').format(n || 0);

export default function Home() {
  const [form, setForm] = useState({ applicant: '', department: '', date: new Date().toISOString().slice(0, 10), purpose: '', budgetCode: '', deliveryDate: '', deliveryPlace: '', payment: '', payee: '', bank: '', account: '' });
  const [items, setItems] = useState<Item[]>([{ name: '餐費', spec: '', unit: '份', qty: 80, price: 100, note: '雅真墊付' }]);
  const [message, setMessage] = useState('');
  const paperRef = useRef<HTMLDivElement>(null);
  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.qty) * Number(item.price), 0), [items]);
  const set = (key: keyof typeof form, value: string) => setForm((old) => ({ ...old, [key]: value }));
  const updateItem = (index: number, key: keyof Item, value: string | number) => setItems((old) => old.map((item, i) => i === index ? { ...item, [key]: value } : item));

  async function submit() {
    if (!form.applicant || !form.purpose || items.every((item) => !item.name)) { setMessage('請填寫申請人、用途說明與至少一筆品項。'); return; }
    const endpoint = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
    if (!endpoint) { setMessage('資料已整理完成。管理者設定 Google Sheets 連線後即可正式送出。'); return; }
    try {
      await fetch(endpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'createRequest', ...form, items, total, loginEmail: document.body.dataset.userEmail || '', submittedAt: new Date().toISOString() }) });
      setMessage('請示單已送出並寫入 Google Sheets。');
    } catch { setMessage('送出失敗，請稍後再試。'); }
  }

  async function downloadPdf() {
    if (!paperRef.current) return;
    setMessage('正在產生 PDF…');
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
    const canvas = await html2canvas(paperRef.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297, undefined, 'FAST');
    pdf.save(`請示單_${form.applicant || '未命名'}_${form.date}.pdf`);
    setMessage('PDF 已下載。');
  }

  return <main><header className="topbar"><div className="brand"><span className="brand-mark">睿</span><div><strong>睿思請示單</strong><small>申請、留存、套版，一次完成</small></div></div><div className="account"><span className="status"><span />已安全登入</span><a href="/signout-with-chatgpt?return_to=%2F">登出</a></div></header>
    <section className="workspace"><div className="form-column"><div className="eyebrow">NEW REQUEST · 新增申請</div><h1>建立請示單</h1><p className="lead">依序填寫資料，右側會即時套入正式 A4 格式。</p>
      <section className="form-card"><SectionTitle n="01" title="基本資料" note="申請人與請示內容"/><div className="grid two"><Field label="申請人 *"><Input value={form.applicant} onChange={(e) => set('applicant', e.target.value)} placeholder="例如：王小明" /></Field><Field label="申請單位"><Input value={form.department} onChange={(e) => set('department', e.target.value)} placeholder="例如：教務處" /></Field></div><div className="grid two"><Field label="請購日期"><Input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} /></Field><Field label="預算科目"><Input value={form.budgetCode} onChange={(e) => set('budgetCode', e.target.value)} placeholder="例如：53220000" /></Field></div><Field label="用途說明 *"><Textarea value={form.purpose} onChange={(e) => set('purpose', e.target.value)} placeholder="請簡述申請用途與原因" /></Field></section>
      <section className="form-card"><div className="section-head"><SectionTitle n="02" title="請購明細" note="品項與預估金額"/><Button variant="outline" onClick={() => setItems((old) => [...old, blankItem()])}><Plus />新增品項</Button></div>{items.map((item, index) => <div className="item" key={index}><div className="item-top"><strong>品項 {String(index + 1).padStart(2, '0')}</strong>{items.length > 1 && <button aria-label="刪除品項" onClick={() => setItems((old) => old.filter((_, i) => i !== index))}><Trash2 size={16}/></button>}</div><div className="grid two"><Field label="品名"><Input value={item.name} onChange={(e) => updateItem(index, 'name', e.target.value)} /></Field><Field label="規格"><Input value={item.spec} onChange={(e) => updateItem(index, 'spec', e.target.value)} /></Field></div><div className="grid four"><Field label="單位"><Input value={item.unit} onChange={(e) => updateItem(index, 'unit', e.target.value)} /></Field><Field label="數量"><Input type="number" min="0" value={item.qty} onChange={(e) => updateItem(index, 'qty', Number(e.target.value))} /></Field><Field label="單價"><Input type="number" min="0" value={item.price} onChange={(e) => updateItem(index, 'price', Number(e.target.value))} /></Field><Field label="小計"><div className="calculated">NT$ {money(item.qty * item.price)}</div></Field></div><Field label="備註"><Input value={item.note} onChange={(e) => updateItem(index, 'note', e.target.value)} /></Field></div>)}<div className="total"><span>預估總額</span><strong>NT$ {money(total)}</strong></div></section>
      <section className="form-card"><SectionTitle n="03" title="交付與付款" note="補充執行資訊"/><div className="grid two"><Field label="交貨日期"><Input type="date" value={form.deliveryDate} onChange={(e) => set('deliveryDate', e.target.value)} /></Field><Field label="交貨地點"><Input value={form.deliveryPlace} onChange={(e) => set('deliveryPlace', e.target.value)} /></Field></div><Field label="支付方式"><Input value={form.payment} onChange={(e) => set('payment', e.target.value)} placeholder="例如：匯款、現金、代墊" /></Field></section>
      <div className="actions"><Button variant="outline" size="lg" onClick={downloadPdf}><Download />下載 PDF</Button><Button size="lg" onClick={submit}><Send />送出並留存</Button></div>{message && <div className="notice" role="status"><FileCheck2 size={18}/>{message}</div>}
    </div><aside className="preview-column"><div className="preview-head"><div><span>即時預覽</span><small>A4 · 210 × 297 mm</small></div><button onClick={downloadPdf} aria-label="下載 PDF"><Download size={18}/></button></div><Paper refProp={paperRef} form={form} items={items} total={total}/></aside></section></main>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="field"><span>{label}</span>{children}</label>; }
function SectionTitle({n,title,note}:{n:string;title:string;note:string}) { return <div className="section-title"><b>{n}</b><div><h2>{title}</h2><p>{note}</p></div></div>; }
function Paper({ refProp, form, items, total }: { refProp: React.RefObject<HTMLDivElement | null>; form: Record<string,string>; items: Item[]; total: number }) {
  const rows=[...items, ...Array(Math.max(0,7-items.length)).fill(null).map(blankItem)].slice(0,7);
  return <div className="paper-wrap"><div className="paper" ref={refProp}><div className="paper-title"><p>基隆市睿思國民小學</p><h2>黏 貼 憑 證 用 紙</h2></div><table><tbody><tr><th>憑證編號</th><td>自動編號</td><th>預算年度</th><td>{Number(form.date.slice(0,4) || 2026)-1911}</td><th>用途說明</th><td rowSpan={3}>{form.purpose || '尚未填寫'}</td></tr><tr><th>預算科目</th><td colSpan={3}>{form.budgetCode || '—'}</td></tr><tr><th>金額</th><td colSpan={3} className="paper-money">NT$ {money(total)}</td></tr></tbody></table><div className="approval"><div>經（承）辦單位</div><div>保管／財物登記</div><div>驗收（證明）</div><div>會計單位</div><div>機關長官或授權代簽人</div></div><div className="tear">（黏　貼　憑　證　線）</div><div className="purchase-head"><span>請購日期：{form.date}</span><h2>請　購（修）單</h2><span>簽證編號：自動編號</span></div><table className="items-table"><thead><tr><th>品名</th><th>規格</th><th>單位</th><th>請購數量</th><th>單價</th><th>預計金額</th><th>備註</th></tr></thead><tbody>{rows.map((item, i)=><tr key={i}><td>{item.name}</td><td>{item.spec}</td><td>{item.unit}</td><td>{item.name ? item.qty : ''}</td><td>{item.name ? money(item.price) : ''}</td><td>{item.name ? money(item.qty*item.price) : ''}</td><td>{item.note}</td></tr>)}<tr><th colSpan={5}>合計新臺幣</th><td colSpan={2}>NT$ {money(total)}</td></tr></tbody></table><table><tbody><tr><th>開支預算科目</th><td colSpan={5}>{form.budgetCode || '—'}</td></tr><tr><th>交貨日期</th><td>{form.deliveryDate || '—'}</td><th>交貨地點</th><td>{form.deliveryPlace || '—'}</td><th>支付方式</th><td>{form.payment || '—'}</td></tr></tbody></table><div className="signatures"><div>申請單位<br/><small>{form.department}<br/>{form.applicant}</small></div><div>經辦單位</div><div>會計單位</div><div>機關長官<br/>或授權代簽人</div></div></div></div>;
}
