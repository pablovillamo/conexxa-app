// ── Brain Generator — estado global ──────────────────────────────────────────
let brainMasterContent = '';
let brainCurrentClientEmail = '';
let currentBrainModulo = 'identidad';

// ── Definición de los 8 módulos ───────────────────────────────────────────────
const BRAIN_MODULOS = [
  {
    slug: 'identidad', num: '01', nombre: 'Identidad', fullName: 'Identidad Estratégica',
    icon: '🧬', docName: 'Identidad_MASTER',
    sub: 'Construí el núcleo estratégico de la marca. Misión, visión, valores, personalidad y tono.',
    secciones: [
      {
        id: 'a', titulo: 'Información general del negocio', abierta: true,
        campos: [
          { id:'bi-nombre',    label:'Nombre de la marca',       tipo:'input', req:true,  placeholder:'Ej: Conexxa' },
          { id:'bi-industria', label:'Industria',                tipo:'input', req:true,  placeholder:'Ej: Consultoría ecommerce' },
          { id:'bi-nicho',     label:'Nicho específico',         tipo:'input', req:true,  placeholder:'Ej: Marcas físicas LATAM' },
          { id:'bi-tipo',      label:'Tipo de negocio',          tipo:'input', req:false, placeholder:'Ej: Consultoría B2B, SaaS...' },
          { id:'bi-pais',      label:'País / mercado',           tipo:'input', req:false, placeholder:'Ej: Costa Rica / LATAM' },
          { id:'bi-tiempo',    label:'Tiempo operando',          tipo:'input', req:false, placeholder:'Ej: 2 años' },
          { id:'bi-web',       label:'Sitio web',                tipo:'input', req:false, placeholder:'https://...' },
          { id:'bi-redes',     label:'Redes sociales',           tipo:'input', req:false, placeholder:'@usuario en IG, TikTok...' },
          { id:'bi-estado',    label:'Estado actual del negocio',tipo:'textarea', req:true, rows:3, hint:'¿Dónde está parado hoy? ¿Factura? ¿Tiene clientes? Sé específico.', placeholder:'Ej: Tengo clientes activos, facturo $X al mes, pero todo depende de mí...' },
        ]
      },
      {
        id: 'b', titulo: 'Contexto profundo de la marca', abierta: false,
        campos: [
          { id:'bi-que-es',      label:'¿Qué es esta marca?',              tipo:'textarea', req:true,  rows:3, hint:'En sus propias palabras, sin frases de marketing.', placeholder:'Ej: Es un sistema de implementación ecommerce...' },
          { id:'bi-vende',       label:'¿Qué vende exactamente?',          tipo:'textarea', req:true,  rows:3, hint:'Producto, servicio, programa. Precio si existe. Cómo funciona.', placeholder:'Ej: Programa de 90 días a $3,000...' },
          { id:'bi-origen',      label:'¿Por qué nació este negocio?',     tipo:'textarea', req:true,  rows:3, hint:'La historia real. El momento, la frustración que lo movió.', placeholder:'Ej: En 2019 empecé vendiendo cámaras Instax...' },
          { id:'bi-problema',    label:'¿Qué problema concreto resuelve?', tipo:'textarea', req:true,  rows:3, hint:'El problema real del cliente. ¿De qué lo libera?', placeholder:'Ej: Libera al dueño de responder chats todo el día...' },
          { id:'bi-diferente',   label:'¿Qué hace diferente a esta marca?',tipo:'textarea', req:true,  rows:3, placeholder:'Ej: No es agencia ni curso. Hacemos implementación directa...' },
          { id:'bi-vision',      label:'¿Qué visión tiene el fundador?',   tipo:'textarea', req:false, rows:3, placeholder:'Ej: Quiero que sea el referente en ecommerce para LATAM...' },
          { id:'bi-impacto',     label:'¿Qué impacto quiere generar?',     tipo:'textarea', req:false, rows:2, placeholder:'Ej: Que las marcas latinoamericanas dejen de operar en el caos...' },
          { id:'bi-emociones',   label:'¿Qué emociones debe transmitir?',  tipo:'textarea', req:true,  rows:3, placeholder:'Ej: Confianza, autoridad, claridad, alivio...' },
          { id:'bi-percepcion',  label:'¿Cómo quiere que la perciban?',    tipo:'textarea', req:true,  rows:3, placeholder:'Ej: Como el operador más confiable de ecommerce en LATAM...' },
          { id:'bi-admira',      label:'¿Qué marcas admira?',              tipo:'textarea', req:false, rows:3, placeholder:'Ej: Apple, Notion, Shopify, Alex Hormozi...' },
          { id:'bi-no-parecer',  label:'¿Qué NO quiere que parezca?',      tipo:'textarea', req:true,  rows:3, placeholder:'Ej: Gurú, agencia genérica, curso de dropshipping...' },
          { id:'bi-personalidad',label:'¿Qué personalidad debería tener?', tipo:'textarea', req:true,  rows:3, placeholder:'Ej: Directa, estratégica, minimalista...' },
          { id:'bi-tono',        label:'¿Qué tono de comunicación?',       tipo:'textarea', req:true,  rows:3, placeholder:'Ej: Ustedeo/voseo, nunca tuteo. Frases cortas...' },
          { id:'bi-palabras',    label:'¿Qué palabras describen mejor la marca?', tipo:'textarea', req:false, rows:2, placeholder:'Ej: Sistemas, estructura, escalar, conversión...' },
          { id:'bi-valores',     label:'¿Qué valores son importantes?',    tipo:'textarea', req:false, rows:3, placeholder:'Ej: Honestidad sobre resultados, sistemas ante improvisación...' },
          { id:'bi-filosofia',   label:'¿Qué filosofía tiene el proyecto?',tipo:'textarea', req:false, rows:3, placeholder:'Ej: Los negocios no necesitan más esfuerzo, necesitan mejores sistemas...' },
          { id:'bi-comunidad',   label:'¿Qué comunidad quiere construir?', tipo:'textarea', req:false, rows:3, placeholder:'Ej: Dueños de marca física en LATAM...' },
          { id:'bi-arquetipo',   label:'¿Qué arquetipo encaja mejor?',     tipo:'textarea', req:true,  rows:3, hint:'Héroe, sabio, gobernante, creador, explorador...', placeholder:'Ej: El Sabio + El Gobernante. Claridad + estructura + ejecución...' },
        ]
      }
    ]
  },
  {
    slug: 'oferta', num: '02', nombre: 'Oferta', fullName: 'Oferta y Posicionamiento',
    icon: '💎', docName: 'Oferta_MASTER',
    sub: 'Definí la oferta principal, el precio, el valor percibido y el posicionamiento en el mercado.',
    secciones: [
      {
        id: 'a', titulo: 'La oferta principal', abierta: true,
        campos: [
          { id:'of-nombre-oferta', label:'Nombre de la oferta',         tipo:'input',    req:true,  placeholder:'Ej: Programa 90 días · Sistema Completo' },
          { id:'of-precio',        label:'Precio',                       tipo:'input',    req:true,  placeholder:'Ej: $3,000 USD pago único' },
          { id:'of-formato',       label:'Formato de entrega',           tipo:'input',    req:true,  placeholder:'Ej: Implementación directa, presencial/remoto, 90 días' },
          { id:'of-duracion',      label:'Duración',                     tipo:'input',    req:false, placeholder:'Ej: 90 días desde el onboarding' },
          { id:'of-que-incluye',   label:'¿Qué incluye exactamente?',    tipo:'textarea', req:true,  rows:4, hint:'Lista todo lo que el cliente recibe. Detallado.', placeholder:'Ej: Shopify optimizado, automatizaciones ManyChat, SEO, email marketing, métricas...' },
          { id:'of-que-no-incluye',label:'¿Qué NO incluye?',             tipo:'textarea', req:false, rows:3, hint:'Importante para alinear expectativas.', placeholder:'Ej: Pauta pagada, producción de contenido, logística...' },
          { id:'of-resultado',     label:'Resultado prometido al final',  tipo:'textarea', req:true,  rows:3, hint:'¿Qué tiene el cliente al día 90 que no tenía antes?', placeholder:'Ej: Ecommerce que vende solo, automatizaciones activas, tráfico orgánico...' },
        ]
      },
      {
        id: 'b', titulo: 'Valor, posicionamiento y ventas', abierta: false,
        campos: [
          { id:'of-por-que-ese-precio', label:'¿Por qué ese precio?',       tipo:'textarea', req:true,  rows:3, hint:'El razonamiento real detrás del precio.', placeholder:'Ej: Valor de $50K+ en ecommerce construido. ROI en 3-6 meses...' },
          { id:'of-comparado',          label:'¿Cómo se compara con otras opciones?', tipo:'textarea', req:false, rows:3, placeholder:'Ej: Una agencia cobra $3K/mes sin resultados garantizados. Nosotros cobramos una vez...' },
          { id:'of-objeciones',         label:'Principales objeciones de compra',    tipo:'textarea', req:true,  rows:4, hint:'¿Qué dice el cliente justo antes de no comprar?', placeholder:'Ej: "Es caro", "Ya lo intenté con una agencia", "No tengo tiempo"...' },
          { id:'of-respuestas-obj',     label:'Respuestas a esas objeciones',        tipo:'textarea', req:false, rows:4, placeholder:'Ej: No es caro, es inversión. Sin estructura perdés más cada mes...' },
          { id:'of-para-quien',         label:'¿Para quién ES esta oferta?',         tipo:'textarea', req:true,  rows:3, placeholder:'Ej: Dueños de marca física LATAM que ya venden pero siguen en el caos...' },
          { id:'of-para-quien-no',      label:'¿Para quién NO ES esta oferta?',      tipo:'textarea', req:false, rows:3, placeholder:'Ej: Dropshipping, negocios sin producto real, quienes buscan resultados rápidos...' },
          { id:'of-proceso-venta',      label:'¿Cómo es el proceso de venta?',       tipo:'textarea', req:false, rows:3, placeholder:'Ej: Llamada de diagnóstico → propuesta → onboarding → programa...' },
        ]
      }
    ]
  },
  {
    slug: 'cliente', num: '03', nombre: 'Cliente', fullName: 'Cliente Ideal',
    icon: '🎯', docName: 'ClienteIdeal_MASTER',
    sub: 'Mapeá en profundidad al cliente ideal: quién es, qué siente, qué busca y cómo toma decisiones.',
    secciones: [
      {
        id: 'a', titulo: 'Perfil del cliente ideal', abierta: true,
        campos: [
          { id:'ci-nombre-avatar', label:'Nombre del avatar (si existe)',  tipo:'input',    req:false, placeholder:'Ej: La dueña de marca, El ecommerce creciente...' },
          { id:'ci-edad',          label:'Rango de edad',                  tipo:'input',    req:false, placeholder:'Ej: 28-45 años' },
          { id:'ci-genero',        label:'Género predominante',            tipo:'input',    req:false, placeholder:'Ej: Femenino / mixto' },
          { id:'ci-pais',          label:'País / región',                  tipo:'input',    req:false, placeholder:'Ej: Costa Rica, México, Colombia, LATAM' },
          { id:'ci-ocupacion',     label:'Ocupación / rol',                tipo:'input',    req:true,  placeholder:'Ej: Dueño/a de marca física, founder, CEO de ecommerce' },
          { id:'ci-facturacion',   label:'Facturación mensual aproximada', tipo:'input',    req:false, placeholder:'Ej: $2,000–$15,000 USD/mes' },
          { id:'ci-estado-negocio',label:'Estado del negocio',             tipo:'textarea', req:true,  rows:3, hint:'¿Dónde está parado cuando llega a la marca?', placeholder:'Ej: Ya vende, tiene producto real, pero todo depende de él/ella. Sin automatizaciones...' },
        ]
      },
      {
        id: 'b', titulo: 'Psicología y comportamiento', abierta: false,
        campos: [
          { id:'ci-dolores',      label:'Sus dolores principales',       tipo:'textarea', req:true,  rows:4, hint:'¿Qué le duele realmente? Lo que le impide dormir.', placeholder:'Ej: Responde mensajes a las 11pm. Pauta que no convierte. Caos operativo...' },
          { id:'ci-miedos',       label:'Sus miedos profundos',          tipo:'textarea', req:true,  rows:3, hint:'Los miedos que nunca dice en voz alta.', placeholder:'Ej: Invertir y que no funcione. Perder tiempo. Que el negocio no escale sin él...' },
          { id:'ci-deseos',       label:'¿Qué desea profundamente?',     tipo:'textarea', req:true,  rows:3, placeholder:'Ej: Un negocio que funcione sin depender de él. Escalar sin caos. Tiempo libre...' },
          { id:'ci-frustraciones',label:'Frustraciones con soluciones anteriores', tipo:'textarea', req:false, rows:3, placeholder:'Ej: Agencias que cobran y no entregan. Cursos que dan teoría sin ejecución...' },
          { id:'ci-como-decide',  label:'¿Cómo toma decisiones de compra?', tipo:'textarea', req:true,  rows:3, hint:'¿Qué necesita ver/sentir para comprar?', placeholder:'Ej: Necesita ver casos reales, métricas concretas, proceso claro...' },
          { id:'ci-donde-busca',  label:'¿Dónde busca información?',      tipo:'textarea', req:false, rows:3, placeholder:'Ej: Instagram, TikTok, recomendaciones de otros dueños...' },
          { id:'ci-lenguaje',     label:'¿Cómo habla / qué palabras usa?', tipo:'textarea', req:false, rows:3, hint:'El lenguaje exacto que usa para describir sus problemas.', placeholder:'Ej: "Me estoy ahogando en mensajes", "No logro escalar", "Mi tienda no convierte"...' },
        ]
      }
    ]
  },
  {
    slug: 'mercado', num: '04', nombre: 'Mercado', fullName: 'Mercado y Competencia',
    icon: '📊', docName: 'Mercado_MASTER',
    sub: 'Analizá el mercado, la competencia y la oportunidad real que existe para la marca.',
    secciones: [
      {
        id: 'a', titulo: 'El mercado', abierta: true,
        campos: [
          { id:'mc-mercado-total',  label:'¿Cómo es el mercado total?',       tipo:'textarea', req:true,  rows:3, hint:'Tamaño aproximado, tendencias, crecimiento.', placeholder:'Ej: Ecommerce LATAM creciendo 25% anual. Millones de marcas sin estructura digital...' },
          { id:'mc-problema-mercado', label:'Problema principal del mercado', tipo:'textarea', req:true,  rows:3, placeholder:'Ej: Las marcas tienen producto pero no tienen sistema. Operan desde el caos...' },
          { id:'mc-oportunidad',    label:'¿Cuál es la oportunidad real?',    tipo:'textarea', req:true,  rows:3, placeholder:'Ej: No existe un servicio que haga implementación directa completa. Todos enseñan o asesoran...' },
          { id:'mc-tendencias',     label:'Tendencias relevantes del mercado', tipo:'textarea', req:false, rows:3, placeholder:'Ej: Boom del ecommerce post-pandemia, IA accesible, social commerce...' },
        ]
      },
      {
        id: 'b', titulo: 'Competencia y posicionamiento', abierta: false,
        campos: [
          { id:'mc-competidores-directos',   label:'Competidores directos',            tipo:'textarea', req:true,  rows:3, hint:'Quiénes hacen lo mismo o algo similar.', placeholder:'Ej: Agencias de ecommerce locales, consultoras digitales...' },
          { id:'mc-competidores-indirectos', label:'Competidores indirectos',          tipo:'textarea', req:false, rows:3, hint:'Alternativas que el cliente evalúa antes de llegar a esta marca.', placeholder:'Ej: Cursos de ecommerce, freelancers, agencias de redes...' },
          { id:'mc-diferenciador-real',      label:'¿Qué hace diferente a esta marca vs la competencia?', tipo:'textarea', req:true, rows:4, placeholder:'Ej: No vendemos asesoría. Hacemos la implementación directa dentro del negocio del cliente...' },
          { id:'mc-posicion',                label:'¿Qué posición ocupa en el mercado?', tipo:'textarea', req:true,  rows:3, hint:'¿Qué promesa única hace que la diferencia?', placeholder:'Ej: El operador de ecommerce más confiable para marcas físicas LATAM...' },
          { id:'mc-barreras',                label:'¿Qué barreras de entrada existen?',  tipo:'textarea', req:false, rows:3, placeholder:'Ej: Alto conocimiento técnico necesario, relaciones, reputación acumulada...' },
        ]
      }
    ]
  },
  {
    slug: 'branding', num: '05', nombre: 'Branding', fullName: 'Branding y Comunicación',
    icon: '✦', docName: 'Branding_MASTER',
    sub: 'Sistema visual, identidad gráfica, paleta, tipografía y estilo de comunicación.',
    secciones: [
      {
        id: 'a', titulo: 'Identidad visual', abierta: true,
        campos: [
          { id:'br-colores',       label:'Colores de la marca',             tipo:'textarea', req:true,  rows:3, hint:'Colores primarios, secundarios, códigos HEX si existen.', placeholder:'Ej: Negro #0A0A0A (base), Verde #22C55E (acento), Blanco #FFFFFF (texto)...' },
          { id:'br-tipografia',    label:'Tipografía',                      tipo:'textarea', req:false, rows:3, placeholder:'Ej: Inter (sans-serif) como principal. DM Mono para datos y código...' },
          { id:'br-estilo-visual', label:'Estilo visual general',           tipo:'textarea', req:true,  rows:3, hint:'¿Cómo se ve? ¿Qué sensación transmite?', placeholder:'Ej: Minimalista, premium, oscuro, sin decoración innecesaria. Tipografía como protagonista...' },
          { id:'br-que-no-visual', label:'¿Qué NO debe tener visualmente?', tipo:'textarea', req:false, rows:3, placeholder:'Ej: Sin gradientes decorativos, sin colores vibrantes, sin diseño "agencial"...' },
          { id:'br-referencias',   label:'Referencias visuales / marcas que admira estéticamente', tipo:'textarea', req:false, rows:3, placeholder:'Ej: Notion, Linear, Apple, Framer...' },
        ]
      },
      {
        id: 'b', titulo: 'Comunicación y copy', abierta: false,
        campos: [
          { id:'br-voz',          label:'Voz de la marca',                tipo:'textarea', req:true,  rows:3, hint:'¿Cómo habla? ¿Qué características tiene su escritura?', placeholder:'Ej: Directa, sin rodeos, sin hipérboles. Frases cortas. Autoridad sin arrogancia...' },
          { id:'br-tono-copy',    label:'Tono en diferentes contextos',   tipo:'textarea', req:false, rows:4, hint:'Ventas vs contenido vs email vs soporte.', placeholder:'Ej: En ventas: estratégico. En contenido: educativo. En email: cercano pero profesional...' },
          { id:'br-palabras-uso', label:'Palabras que SÍ usa la marca',   tipo:'textarea', req:false, rows:2, placeholder:'Ej: Sistemas, estructura, escalar, implementar, datos, métricas...' },
          { id:'br-palabras-no',  label:'Palabras PROHIBIDAS para la marca', tipo:'textarea', req:true, rows:2, placeholder:'Ej: Gurú, hack, viral, pasivo, fórmula secreta, increíble, masterclass...' },
          { id:'br-eslogan',      label:'Eslogan o frase de posicionamiento (si existe)', tipo:'input', req:false, placeholder:'Ej: Estructura que escala. / No asesoría. Implementación.' },
          { id:'br-copy-hero',    label:'Copy hero (frase principal para comunicaciones)', tipo:'textarea', req:false, rows:3, placeholder:'Ej: Tu negocio ya vende. El problema es que todo depende de vos para funcionar. Eso tiene solución...' },
        ]
      }
    ]
  },
  {
    slug: 'vision', num: '06', nombre: 'Visión', fullName: 'Visión y Crecimiento',
    icon: '🚀', docName: 'Vision_MASTER',
    sub: 'Proyección de largo plazo, metas concretas, hoja de ruta y ambición estratégica de la marca.',
    secciones: [
      {
        id: 'a', titulo: 'Visión y proyección', abierta: true,
        campos: [
          { id:'vi-vision-1',    label:'Visión a 1 año',              tipo:'textarea', req:true,  rows:3, placeholder:'Ej: 15 clientes activos, plataforma lanzada, posicionado en LATAM...' },
          { id:'vi-vision-3',    label:'Visión a 3 años',             tipo:'textarea', req:false, rows:3, placeholder:'Ej: 50+ marcas implementadas, metodología licenciada, equipo de 5...' },
          { id:'vi-vision-largo',label:'Visión de largo plazo (5–10 años)', tipo:'textarea', req:false, rows:3, placeholder:'Ej: Referente de ecommerce estructurado en Latinoamérica...' },
          { id:'vi-mision',      label:'Misión actual del negocio',   tipo:'textarea', req:true,  rows:3, hint:'¿Para qué existe este negocio hoy?', placeholder:'Ej: Transformar marcas físicas que ya venden en ecommerce profesionales que escalan...' },
          { id:'vi-impacto',     label:'Impacto que quiere generar',  tipo:'textarea', req:false, rows:3, placeholder:'Ej: Cambiar el estándar del ecommerce LATAM. Que lo normal sea sistematizar...' },
        ]
      },
      {
        id: 'b', titulo: 'Metas y hoja de ruta', abierta: false,
        campos: [
          { id:'vi-metas-6m',    label:'Metas concretas próximos 6 meses', tipo:'textarea', req:true,  rows:4, hint:'Específicas y medibles.', placeholder:'Ej: X clientes activos, $X facturación, lanzar recurso gratuito, llegar a X seguidores...' },
          { id:'vi-metas-12m',   label:'Metas concretas próximos 12 meses',tipo:'textarea', req:false, rows:4, placeholder:'Ej: X clientes, plataforma escalada, primer equipo, $X MRR...' },
          { id:'vi-prioridades', label:'Prioridades estratégicas ahora',    tipo:'textarea', req:true,  rows:3, hint:'Los 3 focos que más importan en este momento.', placeholder:'Ej: 1. Conseguir 5 clientes. 2. Documentar metodología. 3. Lanzar contenido...' },
          { id:'vi-obstaculos',  label:'Obstáculos principales para crecer',tipo:'textarea', req:false, rows:3, placeholder:'Ej: Capacidad de tiempo, equipo, dependencia del fundador...' },
          { id:'vi-expansion',   label:'Planes de expansión o nuevas líneas',tipo:'textarea',req:false, rows:3, placeholder:'Ej: Curso online, comunidad, certificaciones, franquicia de metodología...' },
        ]
      }
    ]
  },
  {
    slug: 'operacion', num: '07', nombre: 'Operación', fullName: 'SOP y Operación General',
    icon: '⚙️', docName: 'Operacion_MASTER',
    sub: 'Cómo funciona el negocio: equipo, procesos, herramientas, onboarding y operación diaria.',
    secciones: [
      {
        id: 'a', titulo: 'Estructura operativa', abierta: true,
        campos: [
          { id:'op-equipo',          label:'¿Quiénes forman el equipo?',      tipo:'textarea', req:true,  rows:3, hint:'Roles, responsabilidades. Aunque sea solo el fundador.', placeholder:'Ej: Solo el fundador ahora. Diseñador freelance. Sin equipo fijo...' },
          { id:'op-herramientas',    label:'Herramientas / stack tecnológico', tipo:'textarea', req:true,  rows:4, hint:'Todas las herramientas que usa el negocio hoy.', placeholder:'Ej: Shopify, ManyChat, GA4, Notion, Loom, Canva, ChatGPT, Supabase...' },
          { id:'op-proceso-cliente', label:'¿Cómo es el proceso con cada cliente?', tipo:'textarea', req:true, rows:4, hint:'Desde que contrata hasta que termina.', placeholder:'Ej: Onboarding → Diagnóstico → Implementación por fases → Entrega final → Soporte...' },
          { id:'op-entregables',     label:'¿Qué entregables genera para el cliente?', tipo:'textarea', req:false, rows:3, placeholder:'Ej: Tienda Shopify, flujos ManyChat, setup SEO, dashboard métricas, documentación...' },
          { id:'op-tiempo-semana',   label:'¿Cómo distribuye el tiempo por semana?', tipo:'textarea', req:false, rows:3, placeholder:'Ej: 50% implementación cliente, 20% ventas, 20% contenido, 10% admin...' },
        ]
      },
      {
        id: 'b', titulo: 'Procesos y cuellos de botella', abierta: false,
        campos: [
          { id:'op-cuellos',       label:'Cuellos de botella actuales',         tipo:'textarea', req:true,  rows:3, hint:'¿Dónde se atasca la operación?', placeholder:'Ej: Todo pasa por el fundador. Sin procesos documentados. Onboarding manual...' },
          { id:'op-sops',          label:'SOPs o procesos documentados (si existen)', tipo:'textarea', req:false, rows:3, placeholder:'Ej: Ninguno documentado / Tengo guía de onboarding en Notion...' },
          { id:'op-metricas-op',   label:'Métricas que mide el negocio internamente', tipo:'textarea', req:false, rows:3, placeholder:'Ej: Clientes activos, NPS, tiempo por cliente, facturación mensual...' },
          { id:'op-automatizaciones', label:'Automatizaciones existentes',       tipo:'textarea', req:false, rows:3, placeholder:'Ej: Email de bienvenida, recordatorio de pago, seguimiento post-programa...' },
          { id:'op-que-delegar',   label:'¿Qué le gustaría delegar primero?',   tipo:'textarea', req:false, rows:3, placeholder:'Ej: Diseño, edición de contenido, administración, soporte al cliente...' },
        ]
      }
    ]
  },
  {
    slug: 'ia', num: '08', nombre: 'IA + Cerebro', fullName: 'IA y Base de Conocimiento',
    icon: '🤖', docName: 'IA_MASTER',
    sub: 'Cómo la marca usa IA, qué información necesita el cerebro para alimentar agentes y automatizaciones.',
    secciones: [
      {
        id: 'a', titulo: 'Uso actual de IA y automatización', abierta: true,
        campos: [
          { id:'ia-usa-ia',        label:'¿Usa IA actualmente?',              tipo:'textarea', req:true,  rows:3, hint:'¿Cuáles herramientas? ¿Para qué?', placeholder:'Ej: ChatGPT para copy. Claude para estrategia. Sin automatizaciones de IA...' },
          { id:'ia-flujos',        label:'¿Qué flujos automatizados tiene hoy?', tipo:'textarea', req:false, rows:3, placeholder:'Ej: Email de bienvenida, respuesta automática de Instagram, ManyChat básico...' },
          { id:'ia-oportunidades', label:'¿Dónde ve más oportunidad para IA?', tipo:'textarea', req:true,  rows:3, hint:'¿Qué procesos podrían automatizarse con IA?', placeholder:'Ej: Atención al cliente, generación de reportes, creación de contenido, análisis de métricas...' },
          { id:'ia-limitaciones',  label:'¿Qué limitaciones tiene con IA hoy?', tipo:'textarea', req:false, rows:3, placeholder:'Ej: No sé programar, no entiendo bien los prompts, no tengo stack técnico...' },
        ]
      },
      {
        id: 'b', titulo: 'Base de conocimiento para agentes', abierta: false,
        campos: [
          { id:'ia-contexto-clave',  label:'Contexto clave que debe conocer un agente de IA de este negocio', tipo:'textarea', req:true, rows:5, hint:'Todo lo que un agente necesita saber para actuar como parte del equipo.', placeholder:'Ej: La marca se llama X, vende Y, el cliente ideal es Z, el tono es formal pero directo, nunca usar la palabra "gurú"...' },
          { id:'ia-reglas-ia',       label:'Reglas que el agente debe seguir siempre',        tipo:'textarea', req:true,  rows:4, placeholder:'Ej: Nunca tutear. Siempre ustedear. No prometer resultados específicos. No usar emojis en copy...' },
          { id:'ia-tareas-agentes',  label:'¿Para qué tareas usaría agentes de IA?',          tipo:'textarea', req:false, rows:3, placeholder:'Ej: Generar propuestas de venta, crear contenido, responder consultas, analizar métricas...' },
          { id:'ia-prompt-base',     label:'¿Hay un prompt base que ya usa o le funciona?',   tipo:'textarea', req:false, rows:4, placeholder:'Ej: "Sos el asistente estratégico de [marca]. Hablás con autoridad, sin hipérboles..."' },
          { id:'ia-datos-privados',  label:'Datos que el agente NUNCA debe revelar',           tipo:'textarea', req:false, rows:3, hint:'Información confidencial que no debe salir en automatizaciones.', placeholder:'Ej: Precios internos, márgenes, información de otros clientes, datos personales...' },
        ]
      }
    ]
  }
];

