'use client';

import { FormEvent, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './estimateCalculator.module.css';
import extra from './estimateCalculatorExtra.module.css';
import funnel from './estimateFunnel.module.css';

type EstimateResult = {
  paint?: { name?: string; years?: string };
  breakdown?: { total?: { min?: number; max?: number } };
  aiComment?: string;
  advice?: string[];
};

export default function EstimateCalculatorSection() {
  const lineUrl = process.env.NEXT_PUBLIC_POKKE_LINE_URL;
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<EstimateResult | null>(null);

  useEffect(() => {
    const doubts = document.querySelector('.doubts');
    const parent = doubts?.parentElement;
    if (!doubts || !parent) return;
    const host = document.createElement('div');
    host.id = 'easy-estimate';
    parent.insertBefore(host, doubts);
    setMount(host);
    const quickLinks = Array.from(document.querySelectorAll('a')).filter(link => link.textContent?.includes('カンタン見積もり'));
    const originalHrefs = quickLinks.map(link => link.getAttribute('href'));
    quickLinks.forEach(link => link.setAttribute('href', '#easy-estimate'));
    if (window.location.hash === '#easy-estimate') host.scrollIntoView({ behavior: 'smooth' });
    return () => {
      quickLinks.forEach((link, index) => {
        if (originalHrefs[index]) link.setAttribute('href', originalHrefs[index]!);
      });
      host.remove();
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/pokke/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingType: form.get('buildingType'),
          area: Number(form.get('area')),
          areaLarge: Number(form.get('area')) >= 80,
          floors: Number(form.get('floors')),
          wallMaterial: form.get('wallMaterial'),
          paintGrade: form.get('paintGrade'),
          additionalWorks: [],
          caulkingAddMeters: 0,
          caulkingReplaceMeters: 0,
        }),
      });
      const data = await response.json() as EstimateResult & { message?: string };
      if (!response.ok) throw new Error(data.message);
      setResult(data);
    } catch {
      setError('概算の取得に失敗しました。時間をおいてもう一度お試しください。');
    } finally {
      setLoading(false);
    }
  }

  if (!mount) return null;
  return createPortal(
    <section className={styles.section}>
      <div className={styles.heading}><p>AI EASY ESTIMATE</p><h2>まずは、わが家の<br/><em>概算費用を確認しませんか？</em></h2><span>気になる相場を、建物の条件からすぐに確認。契約前の比較・検討にもお使いいただけます。</span><div className={extra.badges}><b>相談無料</b><b>約1分で入力</b><b>契約不要</b></div></div>
      <ol className={funnel.steps}><li><b>01</b><span>概算費用を確認</span></li><li><b>02</b><span>見積書・写真で内容を確認</span></li><li><b>03</b><span>詳しい見積もりを依頼</span></li></ol>
      <div className={styles.grid}>
        <form onSubmit={submit} className={styles.form}>
          <label>おうちの種類<select name="buildingType" required defaultValue=""><option value="" disabled>選択してください</option><option value="detached">一戸建て</option><option value="apartment">アパート・マンション</option></select></label>
          <label>建物の広さ（坪）<input name="area" type="number" min="1" max="500" required defaultValue="30"/></label>
          <label>階数<select name="floors" defaultValue="2"><option value="1">1階建て</option><option value="2">2階建て</option><option value="3">3階建て</option><option value="4">4階建て以上</option></select></label>
          <label>外壁材<select name="wallMaterial" required defaultValue=""><option value="" disabled>選択してください</option><option value="siding">サイディング</option><option value="mortar">モルタル</option><option value="alc">ALC</option><option value="exposed_concrete">打ちっぱなしコンクリート</option><option value="tile">タイル</option><option value="unknown">わからない</option></select></label>
          <label>希望する塗料<select name="paintGrade" defaultValue="radical"><option value="silicon">シリコン塗料</option><option value="radical">ラジカル制御型塗料</option><option value="fluorine">フッ素塗料</option><option value="inorganic">無機塗料</option></select></label>
          <button disabled={loading}>{loading ? '概算を計算しています…' : '概算見積もりを確認する →'}</button>
          <small>表示金額は概算です。正確な費用は現地調査後にご案内します。</small>
        </form>
        <aside className={styles.result}>
          {result ? <><p>概算見積もり</p><strong>約 {result.breakdown?.total?.min ?? '—'}〜{result.breakdown?.total?.max ?? '—'}万円</strong><span>選択塗料：{result.paint?.name ?? '—'} {result.paint?.years ? '（耐用目安 ' + result.paint.years + '）' : ''}</span>{result.aiComment && <blockquote>{result.aiComment}</blockquote>}{result.advice?.map(item => <small key={item}>✓ {item}</small>)}<div className={funnel.next}><b>概算の次は、見積書の中身を確認。</b><span>工事範囲・塗料・保証まで、詳細見積もりで分かりやすくご案内します。</span><a className={funnel.primary} href="#contact">詳しい見積もり・現地調査を無料で依頼する →</a>{lineUrl && <a className={funnel.line} href={lineUrl} target="_blank" rel="noreferrer">公式LINEで写真を送って相談する →</a>}<small>※特典・キャンペーンの適用条件は、お問い合わせ時にご案内します。</small></div></> : <><p>入力するとここに概算が表示されます</p><span>金額だけでなく、塗料と建物条件をもとに計算します。</span></>}
          {error && <b className={styles.error}>{error}</b>}
        </aside>
      </div>
    </section>,
    mount,
  );
}
