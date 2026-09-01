'use client';

import { ChangeEvent, useState } from 'react';
import styles from './color.module.css';

type WallBox = { x: number; y: number; width: number; height: number };
type SimulationResponse = { message?: string; parts?: Array<{ type?: string; bbox?: WallBox }> };

const colors = [
  { name: 'やわらかベージュ', code: '19-60D', value: '#d8c3a2' },
  { name: 'ニュアンスグレー', code: 'N-70', value: '#949a99' },
  { name: 'クリーンホワイト', code: 'N-93', value: '#e9e8df' },
  { name: 'チャコールブラック', code: 'N-20', value: '#303635' },
  { name: 'ツートンネイビー', code: '75-30D', value: '#38566b' },
];

export default function ColorSimulation() {
  const [selected, setSelected] = useState(0);
  const [photo, setPhoto] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [wallBox, setWallBox] = useState<WallBox | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState('写真をアップロードするとAIが外壁を検出します');
  const color = colors[selected];

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhoto(URL.createObjectURL(file));
    setWallBox(null);
    setAnalysisStatus('AIが外壁を確認しています…');
    try {
      const form = new FormData();
      form.append('image', file);
      const response = await fetch('/api/pokke/simulation', { method: 'POST', body: form });
      const result = await response.json() as SimulationResponse;
      if (!response.ok) throw new Error(result.message);
      const wall = result.parts?.find(part => part.type === 'wall');
      if (wall?.bbox) {
        setWallBox(wall.bbox);
        setAnalysisStatus('AIが外壁を検出しました');
      } else {
        setAnalysisStatus('外壁の範囲を確認できませんでした。別の写真をお試しください。');
      }
    } catch {
      setAnalysisStatus('画像解析に失敗しました。明るい時間帯の正面写真でお試しください。');
    }
  };

  return <main className={styles.page}>
    <header className={styles.header}>
      <a href="#top" className={styles.logo}><img src="/gaihekipokke-logo.webp" alt="外壁ぽっけ" /></a>
      <nav>
        <a href="#simulation">色を試す</a>
        <a href="/estimate">見積もり診断</a>
      </nav>
    </header>

    <section className={styles.hero} id="top">
      <div className={styles.heroCopy}>
        <p className={styles.kicker}>AI COLOR SIMULATION <b>無料</b></p>
        <h1>塗ってから後悔する前に、<br/><em>自宅の写真で色を<br/>試してみませんか？</em></h1>
        <p>外壁・屋根の色を、スマートフォンでかんたんにシミュレーション。家族で比べて、納得してから次の一歩へ。</p>
        <div className={styles.actions}><a className={styles.primary} href="#simulation">自宅写真で無料シミュレーション <span>→</span></a><a href="/estimate#easy-estimate">概算見積もりも試す</a></div>
        <ul><li>写真はスマホでOK</li><li>色の比較は無料</li><li>相談は任意です</li></ul>
      </div>
      <div className={styles.heroVisual} aria-label="住宅のカラーシミュレーションのイメージ">
        <div className={styles.sky}/><div className={styles.cloud}/>
        <div className={styles.home}><div className={styles.roof}/><div className={styles.wall}/><i/><i/><i/></div>
        <div className={styles.colorTag}><i style={{background: color.value}}/><span>選択中の外壁色<br/><b>{color.name}</b></span></div>
      </div>
    </section>

    <div className={styles.region}>東京都を中心に対応 <span>写真のアップロード・色の比較は無料です</span></div>

    <section className={styles.simulation} id="simulation">
      <div className={styles.heading}><p>CHOOSE A COLOR</p><h2>人気の配色を、<em>わが家に重ねて。</em></h2><span>気になる配色をタップ。自宅写真をアップロードすれば、より具体的に比較できます。</span></div>
      <div className={styles.simGrid}>
        <div className={styles.preview}>
          {photo ? <img src={photo} alt="アップロードした住宅"/> : <div className={styles.sampleHouse}><div className={styles.sampleRoof}/><div className={styles.sampleWall} style={{background: color.value}}/><i/><i/><i/></div>}
          <div className={styles.overlay} style={wallBox ? { background: color.value, left: `${wallBox.x * 100}%`, top: `${wallBox.y * 100}%`, width: `${wallBox.width * 100}%`, height: `${wallBox.height * 100}%` } : { background: color.value }}/>
          <b>● {analysisStatus}</b>
          <aside><i style={{background: color.value}}/><span><strong>{color.name}</strong><small>外壁 {color.code}</small></span></aside>
        </div>
        <div className={styles.controls}>
          <label className={styles.upload}><span>↑</span><span><b>自宅写真を使う</b><small>正面から、明るい時間帯に撮影した写真がおすすめです</small></span><em>写真をアップロード<input type="file" accept="image/*" onChange={upload}/></em></label>
          <p>外壁カラー <small>{selected + 1} / {colors.length}</small></p>
          <div className={styles.swatches}>{colors.map((item, index) => <button type="button" key={item.code} className={selected === index ? styles.active : ''} onClick={() => setSelected(index)}><i style={{background: item.value}}/><span><b>{item.name}</b><small>{item.code}</small></span></button>)}</div>
          <button type="button" className={styles.save} onClick={() => setSaved(true)}>{saved ? '保存しました' : 'この配色を保存する'} <span>→</span></button>
          <a className={styles.estimateLink} href="/estimate#easy-estimate">色も費用も相談したい方はこちら <span>→</span></a>
        </div>
      </div>
    </section>

    <section className={styles.why}>
      <div><p>WHY SIMULATE?</p><h2>「思っていた色と違う」を、<em>施工前に減らす。</em></h2><span>色見本だけでは、外壁の面積・日光・屋根やサッシとの相性まで想像しにくいものです。まずは写真で、気になる違和感を見つけましょう。</span></div>
      <ol>{['小さな色見本と完成後が違う','日光で見え方が変わる','汚れが目立つか心配','屋根やサッシと合わない','周辺住宅から浮いて見える','ツートンの境界が不自然'].map((item, index) => <li key={item}><i>0{index + 1}</i>{item}</li>)}</ol>
    </section>

    <section className={styles.steps}>
      <div className={styles.heading}><p>HOW IT WORKS</p><h2>かんたん <em>3ステップ。</em></h2></div>
      <div>{[['01','自宅写真をアップロード','正面から全体が写った写真を選びます。'],['02','気になる色を選ぶ','外壁・屋根との組み合わせを比較します。'],['03','結果を保存・相談','家族と比べて、必要なら専門家へ相談。']].map(([number,title,copy]) => <article key={number}><i>{number}</i><b>{title}</b><span>{copy}</span></article>)}</div>
    </section>

    <section className={styles.contact}>
      <div><p>FREE COLOR CONSULTATION</p><h2>色選びも、<em>見積もりの不安も。</em></h2><span>カラーシミュレーションの結果をもとに、必要な方だけ専門家へご相談いただけます。</span></div>
      <a href="/estimate#easy-estimate">概算見積もりを試す <span>→</span></a>
    </section>

    <footer className={styles.footer}><a href="#top"><img src="/gaihekipokke-logo.webp" alt="外壁ぽっけ"/></a><p>カラーシミュレーション・見積もり診断<br/>株式会社ユタカホーム　0120-546-111</p><a href="/estimate">見積もり診断へ →</a></footer>
  </main>;
}
