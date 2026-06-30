import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createInscripcion } from '../../services/inscripciones.service';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function FormularioSolicitud({ onBack }) {
  const [formData, setFormData] = useState({ 
    nombreCompleto: '', 
    dni: '', 
    campus_id: '', 
    promocion_id: '', 
    email: '', 
    motivo: '', 
    mensaje: '' 
  });
  
  const [campuses, setCampuses] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const campusSnap = await getDocs(collection(db, 'campus'));
        const promoSnap = await getDocs(collection(db, 'promociones'));
        
        setCampuses(campusSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setPromociones(promoSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error cargando listados para el formulario", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return;
    
    setIsSubmitting(true);
    try {
      // Split nombreCompleto into nombre and apellidos if possible
      const parts = formData.nombreCompleto.trim().split(' ');
      const nombre = parts[0] || '';
      const apellidos = parts.slice(1).join(' ') || '';

      await createInscripcion(null, { 
        nombre: nombre,
        apellidos: apellidos,
        dni: formData.dni,
        campus_id: formData.campus_id,
        promocion_id: formData.promocion_id,
        email: formData.email,
        observaciones: `Motivo: ${formData.motivo} | Mensaje: ${formData.mensaje}`,
        aceptada: false,
        creadoEn: new Date().toISOString(),
        actualizadoEn: new Date().toISOString()
      });
      toast.success('¡Solicitud enviada! Nos pondremos en contacto contigo pronto.');
      setFormData({ nombreCompleto: '', dni: '', campus_id: '', promocion_id: '', email: '', motivo: '', mensaje: '' });
      setCooldown(5);
      if (onBack) {
        onBack();
      }
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error al enviar tu solicitud. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-fade-in max-h-[80vh] overflow-y-auto pr-2 pb-2 custom-scrollbar">
      {onBack && (
        <div className="flex justify-start mb-2 sticky top-0 bg-surface/90 backdrop-blur-md py-2 z-10">
          <button type="button" onClick={onBack} className="text-text-secondary hover:text-brand-primary text-sm font-bold flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Volver al Login
          </button>
        </div>
      )}
      <h3 className="text-2xl font-black text-text-strong text-center mb-2">Solicitar Acceso</h3>
      
      <div className="flex flex-col gap-1 w-full">
        <label className="text-xs font-bold text-gray-500 uppercase">Nombre Completo</label>
        <input 
          type="text" 
          required 
          value={formData.nombreCompleto} 
          onChange={(e) => setFormData({...formData, nombreCompleto: e.target.value})}
          className="w-full px-4 py-3.5 bg-canvas border border-border-default rounded-xl text-text-strong text-[15px] font-semibold transition-all duration-300 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 focus:-translate-y-[2px] shadow-sm"
          placeholder="Juan Pérez"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 w-full">
        <div className="flex flex-col gap-1 w-full md:w-1/2">
          <label className="text-xs font-bold text-gray-500 uppercase">DNI / NIE</label>
          <input 
            type="text" 
            required 
            value={formData.dni} 
            onChange={(e) => setFormData({...formData, dni: e.target.value})}
            className="w-full px-4 py-3.5 bg-canvas border border-border-default rounded-xl text-text-strong text-[15px] font-semibold transition-all duration-300 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 focus:-translate-y-[2px] shadow-sm"
            placeholder="12345678A"
          />
        </div>
        <div className="flex flex-col gap-1 w-full md:w-1/2">
          <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
          <input 
            type="email" 
            required 
            value={formData.email} 
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3.5 bg-canvas border border-border-default rounded-xl text-text-strong text-[15px] font-semibold transition-all duration-300 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 focus:-translate-y-[2px] shadow-sm"
            placeholder="tu@email.com"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 w-full">
        <div className="flex flex-col gap-1 w-full md:w-1/2">
          <label className="text-xs font-bold text-gray-500 uppercase">Campus</label>
          <select 
            required 
            value={formData.campus_id} 
            onChange={(e) => setFormData({...formData, campus_id: e.target.value})}
            className="w-full px-4 py-3.5 bg-canvas border border-border-default rounded-xl text-text-strong text-[15px] font-semibold transition-all duration-300 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 shadow-sm cursor-pointer"
          >
            <option value="">Seleccionar campus</option>
            {campuses.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1 w-full md:w-1/2">
          <label className="text-xs font-bold text-gray-500 uppercase">Promoción</label>
          <select 
            required 
            value={formData.promocion_id} 
            onChange={(e) => setFormData({...formData, promocion_id: e.target.value})}
            className="w-full px-4 py-3.5 bg-canvas border border-border-default rounded-xl text-text-strong text-[15px] font-semibold transition-all duration-300 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 shadow-sm cursor-pointer"
          >
            <option value="">Seleccionar promoción</option>
            {promociones.filter(p => !formData.campus_id || p.campus_id === formData.campus_id).map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1 w-full">
        <label className="text-xs font-bold text-gray-500 uppercase">Motivo</label>
        <select 
          required 
          value={formData.motivo} 
          onChange={(e) => setFormData({...formData, motivo: e.target.value})}
          className="w-full px-4 py-3.5 bg-canvas border border-border-default rounded-xl text-text-strong text-[15px] font-semibold transition-all duration-300 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 shadow-sm cursor-pointer"
        >
          <option value="">Selecciona un motivo</option>
          <option value="Matriculacion">Matriculación</option>
          <option value="Informacion">Información Comercial</option>
          <option value="Soporte">Soporte Técnico</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      <div className="flex flex-col gap-1 w-full">
        <label className="text-xs font-bold text-gray-500 uppercase">Mensaje (Opcional)</label>
        <textarea 
          rows="3"
          value={formData.mensaje} 
          onChange={(e) => setFormData({...formData, mensaje: e.target.value})}
          className="w-full px-4 py-3.5 bg-canvas border border-border-default rounded-xl text-text-strong text-[15px] font-semibold transition-all duration-300 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 shadow-sm resize-none"
          placeholder="Escribe aquí tu mensaje..."
        />
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting || cooldown > 0}
        className="mt-4 w-full bg-brand-gradient text-white border-none py-4 px-6 rounded-xl text-[15px] font-black cursor-pointer transition-all duration-300 flex justify-center items-center gap-3 shadow-glow relative overflow-hidden group hover:shadow-[0px_16px_32px_rgba(255,48,69,0.35)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : cooldown > 0 ? (
          `Espera ${cooldown}s`
        ) : (
          'Enviar Inscripción'
        )}
      </button>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--text-secondary); }
      `}</style>
    </form>
  );
}
