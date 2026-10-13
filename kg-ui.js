/* Known Good UI — the six small components the process tree uses.
   Same props as the components they replace, so the page template only
   changes the namespace. React is read at render time, after support.js
   has loaded it. */
(() => {
  const h = (...a) => window.React.createElement(...a);
  const C = {
    green:'#0E9F6E', greenDeep:'#0B7F58', ink:'#16201C', muted:'#5B6B64',
    line:'#CAD6CF', paper:'#F4F7F5', red:'#D64545', gold:'#F2C14E'
  };
  const font = "'Atkinson Hyperlegible',system-ui,sans-serif";

  function Badge({ tone = 'blue', children }) {
    const tones = {
      blue:{ background:C.green, color:'#fff' }, red:{ background:C.red, color:'#fff' },
      gold:{ background:C.gold, color:C.ink }, neutral:{ background:'#B2B4B2', color:C.ink }
    };
    return h('span', { style:{ ...(tones[tone] || tones.blue), fontFamily:font, fontWeight:700,
      fontSize:'11px', letterSpacing:'.05em', textTransform:'uppercase', padding:'3px 10px',
      borderRadius:'999px', display:'inline-block' } }, children);
  }
  function Tag({ children }) {
    return h('span', { style:{ background:C.paper, border:'1px solid ' + C.line, color:C.ink,
      fontFamily:font, fontSize:'13px', padding:'4px 10px', borderRadius:'999px',
      display:'inline-flex', alignItems:'center', gap:'6px' } }, children);
  }
  function Button({ variant = 'primary', size = 'md', disabled = false, children, onClick, style, ...rest }) {
    const sizes = { sm:{ padding:'8px 16px', fontSize:'13px' }, md:{ padding:'12px 22px', fontSize:'14px' },
      lg:{ padding:'16px 30px', fontSize:'16px' } };
    const variants = {
      primary:{ background:C.green, color:'#fff', border:'1.5px solid ' + C.green },
      secondary:{ background:C.red, color:'#fff', border:'1.5px solid ' + C.red },
      ghost:{ background:'transparent', color:C.green, border:'1.5px solid ' + C.green }
    };
    return h('button', { disabled, onClick, style:{ fontFamily:font, fontWeight:700, letterSpacing:'.02em',
      cursor:disabled ? 'not-allowed' : 'pointer', borderRadius:'6px', opacity:disabled ? .45 : 1,
      display:'inline-flex', alignItems:'center', gap:'8px', justifyContent:'center',
      transition:'filter .12s', ...sizes[size], ...variants[variant], ...style },
      onMouseEnter:e => { e.currentTarget.style.filter = 'brightness(1.1)'; },
      onMouseLeave:e => { e.currentTarget.style.filter = ''; }, ...rest }, children);
  }
  function Input({ label, placeholder, type = 'text', value, onChange, style }) {
    return h('label', { style:{ display:'flex', flexDirection:'column', gap:6, fontFamily:font,
      fontSize:13, color:C.ink, ...style } },
      label && h('span', { style:{ fontWeight:700 } }, label),
      h('input', { type, placeholder, value, onChange, style:{ padding:'10px 14px', fontSize:14,
        fontFamily:font, border:'1.5px solid ' + C.line, borderRadius:'6px', outline:'none',
        background:'#fff', color:C.ink },
        onFocus:e => { e.target.style.borderColor = C.green; },
        onBlur:e => { e.target.style.borderColor = C.line; } }));
  }
  function Select({ label, options = [], value, onChange, style }) {
    return h('label', { style:{ display:'flex', flexDirection:'column', gap:6, fontFamily:font,
      fontSize:13, color:C.ink, ...style } },
      label && h('span', { style:{ fontWeight:700 } }, label),
      h('select', { value, onChange, style:{ padding:'10px 14px', fontSize:14, fontFamily:font,
        border:'1.5px solid ' + C.line, borderRadius:'6px', background:'#fff', color:C.ink, outline:'none' } },
        options.map((o, i) => h('option', { key:i, value:o }, o))));
  }
  function Tabs({ tabs = [], active = 0, onChange }) {
    return h('div', { style:{ display:'flex', gap:4, borderBottom:'2px solid ' + C.line, fontFamily:font } },
      tabs.map((t, i) => h('button', { key:i, onClick:() => onChange && onChange(i), style:{
        background:'none', border:'none', cursor:'pointer', padding:'10px 18px', fontSize:14,
        fontWeight:700, fontFamily:font, color:i === active ? C.greenDeep : C.muted,
        borderBottom:i === active ? '2px solid ' + C.green : '2px solid transparent', marginBottom:-2 } }, t)));
  }
  window.KnownGoodUI = { Badge, Tag, Button, Input, Select, Tabs };
})();
