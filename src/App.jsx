import './App.css';
import { useState, useRef, useEffect } from 'react';

function App() {
  const [ciclos, setCiclos] = useState({
    pintado: { tiempo: 0, corriendo: false },
    carga: { tiempo: 0, corriendo: false },
    descarga: { tiempo: 0, corriendo: false },
    prepCarro: { tiempo: 0, corriendo: false },
    colgado: { tiempo: 0, corriendo: false },
    horno: { tiempo: 0, corriendo: false },
    movMaterial: { tiempo: 0, corriendo: false },
    movCarro: { tiempo: 0, corriendo: false },
    movimiento: { tiempo: 0, corriendo: false },
  });
  const [historialCiclos, setHistorialCiclos] = useState(() => {
    const ciclosGuardados = localStorage.getItem('historialCiclos');
    return ciclosGuardados ? JSON.parse(ciclosGuardados) : [];
  });

  const intervalosRef = useRef({});

  useEffect(() => {
    return () => {
      Object.keys(intervalosRef.current).forEach(key => {
        clearInterval(intervalosRef.current[key]);
      });
    };
  }, []);

  const manejarCicloTarea = (tareaId) => {
    if (!ciclos[tareaId].corriendo) {
      const inicio = Date.now();
      intervalosRef.current[tareaId] = setInterval(() => {
        setCiclos(ciclosPrev => ({
          ...ciclosPrev,
          [tareaId]: {
            ...ciclosPrev[tareaId],
            tiempo: Math.round((Date.now() - inicio) / 1000),
          },
        }));
      }, 1000);
      setCiclos(ciclosPrev => ({
        ...ciclosPrev,
        [tareaId]: { ...ciclosPrev[tareaId], corriendo: true },
      }));
    } else {
      clearInterval(intervalosRef.current[tareaId]);
      intervalosRef.current[tareaId] = null;
      setCiclos(ciclosPrev => ({
        ...ciclosPrev,
        [tareaId]: { ...ciclosPrev[tareaId], corriendo: false },
      }));
    }
  };

  const guardarYReiniciarCiclo = () => {
    // Calcular el tiempo total del ciclo actual
    const tiempoTotal = Object.values(ciclos).reduce((acc, curr) => acc + curr.tiempo, 0);

    // Guardar el ciclo actual en el historial
    const nuevoCiclo = { ...ciclos, tiempoTotal };
    const nuevoHistorial = [...historialCiclos, nuevoCiclo];
    localStorage.setItem('historialCiclos', JSON.stringify(nuevoHistorial));
    setHistorialCiclos(nuevoHistorial);

    // Reiniciar contadores y detener tareas
    Object.keys(ciclos).forEach(key => {
      clearInterval(intervalosRef.current[key]);
      intervalosRef.current[key] = null;
    });
    setCiclos(ciclosPrev => {
      const nuevosCiclos = { ...ciclosPrev };
      Object.keys(nuevosCiclos).forEach(tareaId => {
        nuevosCiclos[tareaId] = { tiempo: 0, corriendo: false };
      });
      return nuevosCiclos;
    });
  };
  
  return (
    <div className="App">
      <button onClick={guardarYReiniciarCiclo}>CICLO SIGUIENTE</button>
      <div className='fondo'>
        {Object.keys(ciclos).map((tareaId) => (
          tareaId !== 'tiempoTotal' && // No creamos un botón para el tiempoTotal
          <button
            key={tareaId}
            className={`boton ${tareaId}`}
            onClick={() => manejarCicloTarea(tareaId)}
          >
            {ciclos[tareaId].corriendo ? ciclos[tareaId].tiempo : '*'}
          </button>
        ))}
      </div>
      <div className="historial-ciclos">
        <h2>Historial de Ciclos</h2>
        {historialCiclos.map((ciclo, index) => (
          <div key={index} className="ciclo-detalle">
            <p>Ciclo {index + 1}: Tiempo Total - {ciclo.tiempoTotal} segundos</p>
            {/* Aquí puedes agregar detalles de cada tarea si lo deseas */}
            <ul>
              {Object.keys(ciclo).filter(key => key !== 'tiempoTotal').map(tareaId => (
                <li key={tareaId}>{tareaId}: {ciclo[tareaId].tiempo} segundos</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
