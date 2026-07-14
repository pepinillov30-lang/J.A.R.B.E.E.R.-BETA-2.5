import { useEffect, useRef, useState } from 'react';
import { Avatar } from './Avatar';

interface AvatarResponsiveProps {
  active?: boolean;
  responding?: boolean;
}

/**
 * Avatar.tsx recibe `size` como número fijo en píxeles y no debe modificarse
 * (su diseño ya está cerrado). Este wrapper mide el ancho real disponible
 * del contenedor padre (que sí puede ser fluido con CSS) y traduce ese
 * ancho a un `size` numérico, para que el avatar escale de verdad con la
 * pantalla en vez de quedarse en un tamaño fijo pequeño.
 */
export function AvatarResponsive({ active, responding }: AvatarResponsiveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(280);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const width = el.getBoundingClientRect().width;
      if (width > 0) setSize(Math.round(width));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full flex items-center justify-center">
      <Avatar size={size} active={active} responding={responding} />
    </div>
  );
}
