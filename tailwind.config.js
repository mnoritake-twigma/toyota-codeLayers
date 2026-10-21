export default {
 content: ['./index.html','./src/**/*.{ts,tsx}'],
 theme: {
 colors: Object.fromEntries(['ink','muted','line','paper','surface','accent','danger','success','white'].map(k=>[k,`var(--color-${k})`])),
 spacing: Object.fromEntries(['0','1','2','3','4','5','6','8','10','12','16','20'].map(k=>[k,`var(--space-${k})`])),
 borderRadius: { none:'0', sm:'var(--radius-sm)', card:'var(--radius-card)' },
 fontSize: Object.fromEntries(['xs','sm','base','lg','xl','2xl','3xl'].map(k=>[k,`var(--text-${k})`])),
 extend: { maxWidth:{ page:'var(--page-width)' }, letterSpacing:{ brand:'var(--tracking-brand)' } }
 }, plugins: []
};
