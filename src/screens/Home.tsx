import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, FlaskConical, Library, MessageSquare, Activity, ListChecks, Bell, Volume2, VolumeX, ArrowRight, Radio, Cpu, FileText } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { AvatarResponsive } from '../components/AvatarResponsive';
import { MicButton, type MicState } from '../components/MicButton';
import { GlassCard } from '../components/GlassCard';
import { quickActions, type Screen } from '../data/mockData';
import { USER_NAME, APP_VERSION, type SystemMode } from '../lib/config';
import { useSystemStatus } from '../lib/useSystemStatus';

const ICON_MAP: Record<string, typeof FlaskConical> = { FlaskConical, Library, MessageSquare };

interface HomeProps {
  micState: MicState; onMic: () => void;
  onNavigate: (s: Screen) => void;
  soundEnabled: boolean; onToggleSound: () => void;
  mode: SystemMode; onToggleMode: () => void;
}

export function Home({ micState, onMic, onNavigate, soundEnabled, onToggleSound, mode, onToggleMode }: HomeProps) {
  const [time, setTime] = useState(fmtTime);
  const tmr = useRef<ReturnType<typeof setInterval>|null>(null);
  const { status: systemStatus, connected } = useSystemStatus(mode);
  const live = mode === 'bunker';

  useEffect(() => {
    tmr.current = setInterval(() => setTime(fmtTime()), 1000);
    return () => { if (tmr.current) clearInterval(tmr.current); };
  }, []);

  const isActive    = micState !== 'idle';
  const isResponding = micState === 'responding';
  const dateStr = new Date().toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long' });

  return (
    <div className="flex min-h-full flex-col px-4 pb-32 pt-[max(env(safe-area-inset-top),16px)]">

      {/* Top bar */}
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
        className="flex items-center justify-between pb-2"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-sm font-bold tracking-[0.15em] text-white">J.A.R.B.E.E.R.</h1>
            <span className="rounded px-1.5 py-0.5 font-mono text-[8px] tracking-widest uppercase"
              style={{ background:'rgba(255,170,0,0.1)', border:'1px solid rgba(255,170,0,0.22)', color:'#FFAA00' }}
            >{APP_VERSION}</span>
          </div>
          <p className="font-mono text-[10px] capitalize" style={{ color:'rgba(74,96,112,0.7)' }}>{dateStr}</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileTap={{ scale:0.92 }} onClick={onToggleMode}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all duration-300"
            style={{ background:live?'rgba(255,170,0,0.07)':'rgba(52,211,153,0.07)', border:`1px solid ${live?'rgba(255,170,0,0.22)':'rgba(52,211,153,0.22)'}` }}
            aria-label={live ? 'Cambiar a modo Online' : 'Cambiar a modo Búnker'}
          >
            <span className="h-1.5 w-1.5 rounded-full"
              style={{ background:live?'#FFAA00':'#34d399', boxShadow:`0 0 6px ${live?'rgba(255,170,0,0.8)':'rgba(52,211,153,0.8)'}`, animation:'live-pulse 2s ease-in-out infinite' }}
            />
            <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color:live?'#FFAA00':'#34d399' }}>{live?'BÚNKER':'ONLINE'}</span>
          </motion.button>
          <motion.button whileTap={{ scale:0.9 }} onClick={onToggleSound}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200"
            style={{ background:soundEnabled?'rgba(0,225,255,0.07)':'rgba(255,255,255,0.04)', border:soundEnabled?'1px solid rgba(0,225,255,0.18)':'1px solid rgba(255,255,255,0.06)' }}
            aria-label={soundEnabled?'Silenciar':'Activar sonido'}
          >
            {soundEnabled ? <Volume2 size={13} style={{ color:'#00e1ff' }}/> : <VolumeX size={13} style={{ color:'rgba(74,96,112,0.65)' }}/>}
          </motion.button>
          <button className="relative flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)' }} aria-label="Alertas"
          >
            <Bell size={13} style={{ color:'rgba(74,96,112,0.65)' }} />
            {systemStatus.alerts > 0 && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full" style={{ background:'#FA6A00', boxShadow:'0 0 6px rgba(250,106,0,0.8)' }} />}
          </button>
        </div>
      </motion.div>

      {/* ── Reactor centerpiece ── */}
      <motion.div
        initial={{ opacity:0, scale:0.86 }} animate={{ opacity:1, scale:1 }}
        transition={{ duration:1.0, delay:0.1, ease:[0.22,1,0.36,1] }}
        className="relative flex flex-col items-center py-2"
      >
        {/* Platform glow */}
        <div className="pointer-events-none absolute bottom-0 h-16 w-full rounded-full"
          style={{ background:`radial-gradient(ellipse, rgba(${isResponding?'255,170,0':'0,135,255'},0.22) 0%, transparent 70%)`, filter:'blur(16px)', transition:'background 0.7s' }}
        />

        {/* Clock */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
          className="mb-1 font-display text-4xl font-black tracking-widest text-white"
          style={{ textShadow:'0 0 40px rgba(255,255,255,0.12)' }}
        >{time}</motion.div>

        <div style={{ width:'min(78vw, 46vh, 420px)', maxWidth: 420 }} className="flex items-center justify-center">
          <AvatarResponsive active={isActive} responding={isResponding} />
        </div>

        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.55 }}
          className="mt-1 text-center"
        >
          <p className="font-display text-xl font-semibold text-white">Hola, <span style={{ color:'#FFAA00' }}>{USER_NAME}</span></p>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className="live-dot" />
            <span className="font-mono text-xs" style={{ color:'#34d399' }}>Todos los sistemas operativos</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Metrics grid */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          { icon:<Thermometer size={14}/>,  label:'Temperatura', value:`${systemStatus.temperature.toFixed(1)}°C`, sub:`→ ${systemStatus.targetTemp.toFixed(1)}°C`, accent:'amber' },
          { icon:<FlaskConical size={14}/>,  label:'Lote activo',  value:'26-017',                                   sub:'Golden Ale',               accent:'cyan' },
          { icon:<ListChecks size={14}/>,   label:'Próxima tarea',value:systemStatus.nextTask,                        sub:'Programada · 14:30',       accent:'orange' },
          { icon:<Activity size={14}/>,     label:'Estado',       value:systemStatus.state,                          sub:`Uptime ${systemStatus.uptime}`, accent:'emerald' },
          { icon:<FileText size={14}/>,     label:'Documentos',   value:String(systemStatus.docsIndexed),             sub:'Indexados',                accent:'cyan' },
          { icon:<Cpu size={14}/>,          label:'IA',           value:systemStatus.aiModel,                        sub:systemStatus.aiStatus,      accent:'orange' },
        ].map((m, i) => <MetricCard key={i} {...m} delay={0.18 + i*0.04} />)}
      </div>

      {/* Network pill */}
      <GlassCard className="mt-3 flex items-center gap-3 px-4 py-3" delay={0.42}>
        <Radio size={13} style={{ color:'#00e1ff' }} />
        <span className="flex-1 font-mono text-xs" style={{ color:'rgba(74,96,112,0.8)' }}>Red · {live ? (connected ? 'Búnker conectado' : 'Búnker sin señal (datos simulados)') : 'Modo online · datos simulados'}</span>
        <span className="flex items-center gap-1.5">
          <span className="live-dot" />
          <span className="font-mono text-xs" style={{ color:'#34d399' }}>{systemStatus.network}</span>
        </span>
      </GlassCard>

      {/* Mic */}
      <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.46 }}
        className="mt-7 flex flex-col items-center"
      >
        <MicButton state={micState} onPress={onMic} size="large" />
      </motion.div>

      {/* Quick actions */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.52 }} className="mt-8">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color:'rgba(42,61,82,0.9)' }}>Accesos rápidos</p>
        <div className="space-y-2.5">
          {quickActions.map((action, idx) => {
            const Icon = ICON_MAP[action.icon] ?? FlaskConical;
            return (
              <motion.button key={action.id}
                onClick={() => onNavigate(action.id)}
                whileHover={{ x:4 }} whileTap={{ scale:0.98 }}
                initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.56+idx*0.07 }}
                className="group flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all duration-200"
                style={{ background:'rgba(255,255,255,0.022)', border:'1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.border='1px solid rgba(0,225,255,0.18)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.border='1px solid rgba(255,255,255,0.06)'; }}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ background:'rgba(0,225,255,0.06)', border:'1px solid rgba(0,225,255,0.12)', color:'#00e1ff' }}
                >
                  <Icon size={20}/>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-semibold text-white">{action.label}</p>
                  <p className="truncate font-mono text-[11px]" style={{ color:'rgba(74,96,112,0.75)' }}>{action.description}</p>
                </div>
                {action.value && (
                  <span className="shrink-0 rounded-lg px-2.5 py-1 font-mono text-xs font-bold"
                    style={{ background:'rgba(255,170,0,0.09)', border:'1px solid rgba(255,170,0,0.18)', color:'#FFAA00' }}
                  >{action.value}</span>
                )}
                <ArrowRight size={15} className="shrink-0" style={{ color:'rgba(74,96,112,0.45)', transition:'color 0.2s' }} />
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function fmtTime() {
  return new Date().toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' });
}

function MetricCard({ icon, label, value, sub, accent, delay }: {
  icon: React.ReactNode; label: string; value: string; sub: string; accent: string; delay: number;
}) {
  const C: Record<string,{text:string;glow:string;border:string;bg:string}> = {
    amber:   { text:'#FFAA00', glow:'rgba(255,170,0,0.18)',   border:'rgba(255,170,0,0.11)',   bg:'rgba(255,170,0,0.04)' },
    cyan:    { text:'#00e1ff', glow:'rgba(0,225,255,0.18)',   border:'rgba(0,225,255,0.11)',   bg:'rgba(0,225,255,0.04)' },
    orange:  { text:'#FA6A00', glow:'rgba(250,106,0,0.22)',   border:'rgba(250,106,0,0.13)',   bg:'rgba(250,106,0,0.04)' },
    emerald: { text:'#34d399', glow:'rgba(52,211,153,0.16)',  border:'rgba(52,211,153,0.11)',  bg:'rgba(52,211,153,0.04)' },
  };
  const c = C[accent] ?? C.cyan;
  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay, ease:[0.22,1,0.36,1] }}
      className="rounded-2xl p-4"
      style={{ background:c.bg, border:`1px solid ${c.border}`, boxShadow:`0 4px 18px ${c.glow}` }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span style={{ color:c.text }}>{icon}</span>
        <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color:'rgba(74,96,112,0.75)' }}>{label}</span>
      </div>
      <p className="font-display text-xl font-bold leading-tight" style={{ color:c.text, textShadow:`0 0 10px ${c.glow}` }}>{value}</p>
      <p className="mt-0.5 font-mono text-[10px]" style={{ color:'rgba(74,96,112,0.65)' }}>{sub}</p>
    </motion.div>
  );
}
