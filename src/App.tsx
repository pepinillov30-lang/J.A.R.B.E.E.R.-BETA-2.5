import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BackgroundFX } from './components/BackgroundFX';
import { BottomNav } from './components/BottomNav';
import { BootScreen } from './screens/BootScreen';
import { Home } from './screens/Home';
import { Production } from './screens/Production';
import { Documents } from './screens/Documents';
import { Assistant } from './screens/Assistant';
import type { Screen, ChatMessage } from './data/mockData';
import { initialChat, voiceCommands } from './data/mockData';
import type { MicState } from './components/MicButton';
import { playSound } from './lib/sound';
import { getMode, setMode as persistMode, type SystemMode } from './lib/config';
import { api } from './lib/api';
import {
  startListening, stopListening, isVoiceRecognitionAvailable,
  speak, cancelSpeech,
} from './lib/voice';

const PV = {
  initial: { opacity:0, y:14, filter:'blur(5px)' },
  animate: { opacity:1, y:0,  filter:'blur(0px)' },
  exit:    { opacity:0, y:-10, filter:'blur(4px)' },
};
const PT = { duration:0.37, ease:[0.22,1,0.36,1] as [number,number,number,number] };

export default function App() {
  const [booted, setBooted]   = useState(false);
  const [screen, setScreen]   = useState<Screen>('home');
  const [mic, setMic]         = useState<MicState>('idle');
  const [msgs, setMsgs]       = useState<ChatMessage[]>(initialChat);
  const [typing, setTyping]   = useState(false);
  const [sound, setSound]     = useState(true);
  const [voiceOn, setVoiceOn] = useState(true);
  const [mode, setModeState]  = useState<SystemMode>(() => getMode());
  const timers                = useRef<ReturnType<typeof setTimeout>[]>([]);
  const transcriptRef         = useRef('');

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current=[]; };

  const toggleMode = useCallback(() => {
    setModeState(prev => {
      const next: SystemMode = prev === 'bunker' ? 'online' : 'bunker';
      persistMode(next);
      return next;
    });
  }, []);

  const navigate = useCallback((s: Screen) => {
    playSound('navigate', sound); setScreen(s);
  }, [sound]);

  const now = () => new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});

  const respondTo = useCallback(async (userText: string) => {
    setMsgs(p=>[...p,{id:`u${Date.now()}`,role:'user',content:userText,timestamp:now()}]);
    setTyping(true);
    setMic('responding');

    const lower = userText.toLowerCase();
    const match = voiceCommands.find(c=>c.triggers.some(t=>lower.includes(t)));

    let reply = match?.response ?? 'Comando recibido. Procesando en modo local.';
    try {
      const res = await api.sendCommand(userText);
      if (!match && res?.reply) reply = res.reply;
    } catch { /* se mantiene la respuesta local de respaldo */ }

    playSound('confirm', sound);
    speak(reply, voiceOn);
    setMsgs(p=>[...p,{id:`a${Date.now()}`,role:'assistant',content:reply,timestamp:now(),navigateTo:match?.target}]);
    setTyping(false);
    setMic('idle');
    api.resetAvatar().catch(()=>{});
    if (match?.action==='navigate' && match.target) setTimeout(()=>setScreen(match.target!), 600);
  }, [sound, voiceOn]);

  const handleMic = useCallback(() => {
    if (mic === 'listening') {
      stopListening();
      setMic('idle');
      return;
    }
    if (mic !== 'idle') return;
    clearTimers();
    cancelSpeech();

    if (!isVoiceRecognitionAvailable()) {
      // Sin soporte de reconocimiento de voz en este navegador: aviso hablado/breve y salimos.
      const msg = 'Reconocimiento de voz no disponible en este navegador. Usa Chrome o Edge, o escribe tu comando.';
      speak(msg, voiceOn);
      setMsgs(p=>[...p,{id:`a${Date.now()}`,role:'assistant',content:msg,timestamp:now()}]);
      return;
    }

    playSound('listen', sound);
    setMic('listening');
    transcriptRef.current = '';
    let resuelto = false;

    startListening(
      (transcript, isFinal) => {
        transcriptRef.current = transcript;
        if (isFinal && !resuelto) {
          resuelto = true;
          playSound('process', sound);
          setMic('processing');
          setTimeout(() => respondTo(transcript), 300);
        }
      },
      (_error) => {
        resuelto = true;
        setMic('idle');
      },
      () => {
        // onend: si terminó sin resultado final, volvemos a idle
        setMic(current => current === 'listening' ? 'idle' : current);
      }
    );
  }, [mic, sound, voiceOn, respondTo]);

  const handleSend = useCallback((text: string) => {
    respondTo(text);
  }, [respondTo]);

  return (
    <>
      <BackgroundFX/>
      <AnimatePresence>
        {!booted && <BootScreen key="boot" onComplete={()=>setBooted(true)} soundEnabled={sound}/>}
      </AnimatePresence>
      {booted && (
        <div className="relative mx-auto flex h-[100dvh] max-w-2xl flex-col">
          <div className="relative z-10 flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div key={screen} variants={PV} initial="initial" animate="animate" exit="exit" transition={PT} className="min-h-full">
                {screen==='home'       && <Home micState={mic} onMic={handleMic} onNavigate={navigate} soundEnabled={sound} onToggleSound={()=>setSound(v=>!v)} mode={mode} onToggleMode={toggleMode}/>}
                {screen==='production' && <Production/>}
                {screen==='documents'  && <Documents/>}
                {screen==='assistant'  && <Assistant messages={msgs} micState={mic} onMic={handleMic} onSend={handleSend} typing={typing} onNavigate={navigate}/>}
              </motion.div>
            </AnimatePresence>
          </div>
          <BottomNav active={screen} onNavigate={navigate} soundEnabled={sound}/>
        </div>
      )}
    </>
  );
}
