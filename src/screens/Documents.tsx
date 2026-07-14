import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText, TestTube, Leaf, FlaskConical, History, Receipt, Library } from 'lucide-react';
import { ScreenHeader } from '../components/ScreenHeader';
import { documents, type DocCategory, type DocItem } from '../data/mockData';

const CATS: { id: DocCategory|'Todos'; label: string; icon: React.ReactNode }[] = [
  {id:'Todos',    label:'Todos',    icon:<Library size={12}/>},
  {id:'Receta',   label:'Receta',   icon:<FileText size={12}/>},
  {id:'COA',      label:'COA',      icon:<TestTube size={12}/>},
  {id:'Insumo',   label:'Insumo',   icon:<Leaf size={12}/>},
  {id:'Levadura', label:'Levadura', icon:<FlaskConical size={12}/>},
  {id:'Historial',label:'Historial',icon:<History size={12}/>},
  {id:'Factura',  label:'Factura',  icon:<Receipt size={12}/>},
];

const CC: Record<DocCategory, {text:string;border:string;bg:string}> = {
  Receta:    {text:'#00e1ff',border:'rgba(0,225,255,0.22)',   bg:'rgba(0,225,255,0.07)'},
  COA:       {text:'#FFAA00',border:'rgba(255,170,0,0.22)',   bg:'rgba(255,170,0,0.07)'},
  Insumo:    {text:'#34d399',border:'rgba(52,211,153,0.22)',  bg:'rgba(52,211,153,0.07)'},
  Levadura:  {text:'#a78bfa',border:'rgba(167,139,250,0.22)', bg:'rgba(167,139,250,0.07)'},
  Historial: {text:'#60a5fa',border:'rgba(96,165,250,0.22)',  bg:'rgba(96,165,250,0.07)'},
  Factura:   {text:'#fb923c',border:'rgba(251,146,60,0.22)',  bg:'rgba(251,146,60,0.07)'},
};

export function Documents() {
  const [query, setQuery]   = useState('');
  const [cat, setCat]       = useState<DocCategory|'Todos'>('Todos');
  const [openId, setOpenId] = useState<string|null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return documents.filter(d =>
      (cat==='Todos'||d.category===cat) &&
      (!q || d.title.toLowerCase().includes(q) || d.reference.toLowerCase().includes(q) || d.excerpt.toLowerCase().includes(q))
    );
  }, [query, cat]);

  const openDoc = openId ? documents.find(d=>d.id===openId) : null;

  return (
    <div className="flex min-h-full flex-col pb-32">
      <ScreenHeader title="Biblioteca" subtitle={`${documents.length} documentos indexados`}
        right={<span className="font-mono text-xs" style={{color:'rgba(74,96,112,0.7)'}}>{filtered.length} resultado{filtered.length!==1?'s':''}</span>}
      />
      <div className="flex flex-col gap-4 px-4">

        {/* Search */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.4}} className="relative">
          <Search size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{color:'rgba(74,96,112,0.6)'}}/>
          <input value={query} onChange={e=>setQuery(e.target.value)}
            placeholder="Buscar documentos..."
            className="w-full rounded-2xl py-3.5 pl-10 pr-9 font-mono text-sm placeholder:text-opacity-40 focus:outline-none"
            style={{background:'rgba(13,24,36,0.7)',border:'1px solid rgba(255,255,255,0.07)',color:'#e8f0f8','--tw-placeholder-opacity':'1',transition:'border-color 0.2s'} as React.CSSProperties}
            onFocus={e=>{(e.target as HTMLInputElement).style.borderColor='rgba(0,225,255,0.28)';}}
            onBlur={e=>{(e.target as HTMLInputElement).style.borderColor='rgba(255,255,255,0.07)';}}
          />
          {query && <button onClick={()=>setQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2"><X size={13} style={{color:'rgba(74,96,112,0.6)'}}/></button>}
        </motion.div>

        {/* Category pills */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.1}} className="flex gap-2 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
          {CATS.map(({id,label,icon})=>{
            const on=cat===id;
            return (
              <motion.button key={id} onClick={()=>setCat(id)} whileTap={{scale:0.94}}
                className="flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 font-mono text-[10px] uppercase tracking-wider transition-all duration-200"
                style={{background:on?'rgba(0,225,255,0.09)':'rgba(13,24,36,0.7)',border:on?'1px solid rgba(0,225,255,0.26)':'1px solid rgba(255,255,255,0.06)',color:on?'#00e1ff':'rgba(74,96,112,0.7)'}}
              >
                <span style={{color:on?'#00e1ff':'rgba(74,96,112,0.55)'}}>{icon}</span>{label}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Cards */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.length===0
              ? <motion.div key="empty" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="py-12 text-center">
                  <Library size={32} className="mx-auto mb-3 opacity-20" style={{color:'#00e1ff'}}/>
                  <p className="font-mono text-sm" style={{color:'rgba(74,96,112,0.6)'}}>Sin resultados</p>
                </motion.div>
              : filtered.map((doc,idx)=><DocCard key={doc.id} doc={doc} delay={idx*0.04} onOpen={()=>setOpenId(doc.id)}/>)
            }
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {openDoc && <DocDetail doc={openDoc} onClose={()=>setOpenId(null)}/>}
      </AnimatePresence>
    </div>
  );
}

function DocCard({doc,delay,onOpen}:{doc:DocItem;delay:number;onOpen:()=>void}) {
  const c=CC[doc.category];
  return (
    <motion.button layout initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:0.97}} transition={{duration:0.32,delay}}
      onClick={onOpen} className="group w-full rounded-2xl p-4 text-left transition-all duration-200"
      style={{background:'rgba(13,24,36,0.6)',border:'1px solid rgba(255,255,255,0.06)'}}
      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(0,225,255,0.16)';}}
      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.06)';}}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{background:c.bg,border:`1px solid ${c.border}`,color:c.text}}><FileText size={17}/></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-display text-sm font-semibold text-white truncate">{doc.title}</p>
            <span className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide" style={{background:c.bg,border:`1px solid ${c.border}`,color:c.text}}>{doc.category}</span>
          </div>
          <p className="mt-0.5 font-mono text-[10px]" style={{color:'rgba(74,96,112,0.6)'}}>{doc.reference}</p>
          <p className="mt-1.5 line-clamp-2 font-sans text-xs leading-relaxed" style={{color:'rgba(100,128,150,0.8)'}}>{doc.excerpt}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t pt-2.5" style={{borderColor:'rgba(255,255,255,0.05)'}}>
        <span className="font-mono text-[9px]" style={{color:'rgba(74,96,112,0.55)'}}>{doc.date}</span>
        <div className="flex items-center gap-3">
          {doc.size&&<span className="font-mono text-[9px]" style={{color:'rgba(74,96,112,0.55)'}}>{doc.size}</span>}
          <span className="font-mono text-[9px]" style={{color:'rgba(74,96,112,0.55)'}}>{doc.pages} pág.</span>
          <span className="font-mono text-[10px] transition-colors group-hover:text-cyan-400" style={{color:'rgba(0,225,255,0.38)'}}>Ver →</span>
        </div>
      </div>
    </motion.button>
  );
}

function DocDetail({doc,onClose}:{doc:DocItem;onClose:()=>void}) {
  const c=CC[doc.category];
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-40 flex items-end justify-center p-4"
      style={{background:'rgba(2,4,8,0.85)',backdropFilter:'blur(10px)'}}
      onClick={onClose}
    >
      <motion.div initial={{y:55,opacity:0,scale:0.97}} animate={{y:0,opacity:1,scale:1}} exit={{y:40,opacity:0}}
        transition={{duration:0.35,ease:[0.22,1,0.36,1]}}
        className="hud w-full max-w-lg p-6" onClick={e=>e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{background:c.bg,border:`1px solid ${c.border}`,color:c.text}}><FileText size={21}/></div>
            <div>
              <h3 className="font-display text-base font-bold text-white">{doc.title}</h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase" style={{background:c.bg,border:`1px solid ${c.border}`,color:c.text}}>{doc.category}</span>
                <span className="font-mono text-[10px]" style={{color:'rgba(74,96,112,0.6)'}}>{doc.reference}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)'}}><X size={15} style={{color:'rgba(74,96,112,0.7)'}}/></button>
        </div>
        <div className="mb-5 rounded-xl p-4" style={{background:'rgba(255,255,255,0.022)',border:'1px solid rgba(255,255,255,0.05)'}}>
          <p className="font-sans text-sm leading-relaxed" style={{color:'rgba(180,200,216,0.85)'}}>{doc.excerpt}</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[{l:'Fecha',v:doc.date},{l:'Páginas',v:`${doc.pages} pág.`},{l:'Tamaño',v:doc.size??'—'}].map(m=>(
            <div key={m.l} className="rounded-xl p-3 text-center" style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.05)'}}>
              <p className="font-mono text-[9px] uppercase tracking-wider" style={{color:'rgba(74,96,112,0.6)'}}>{m.l}</p>
              <p className="mt-1 font-mono text-xs text-white">{m.v}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
