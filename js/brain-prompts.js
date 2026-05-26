// ── Construir prompts por módulo ──────────────────────────────────────────────
function buildModulePrompt(slug, v) {
  const prompts = {
    identidad: buildPromptIdentidad,
    oferta:    buildPromptOferta,
    cliente:   buildPromptCliente,
    mercado:   buildPromptMercado,
    branding:  buildPromptBranding,
    vision:    buildPromptVision,
    operacion: buildPromptOperacion,
    ia:        buildPromptIA,
  };
  const fn = prompts[slug];
  return fn ? fn(v) : '';
}

function g(v, id) { return v[id] || '—'; }

function buildPromptIdentidad(v) {
  return `Eres un estratega senior de marca con experiencia en branding, posicionamiento y construcción de marcas premium en Latinoamérica.

Con la siguiente información construye el documento completo "Identidad_MASTER.md". 13 secciones con profundidad estratégica real. Sin resumir, sin clichés, sin frases vacías.

DATOS:
Nombre: ${g(v,'bi-nombre')} | Industria: ${g(v,'bi-industria')} | Nicho: ${g(v,'bi-nicho')}
Tipo: ${g(v,'bi-tipo')} | País: ${g(v,'bi-pais')} | Tiempo operando: ${g(v,'bi-tiempo')}
Web: ${g(v,'bi-web')} | Redes: ${g(v,'bi-redes')}
Estado actual: ${g(v,'bi-estado')}

CONTEXTO:
¿Qué es? ${g(v,'bi-que-es')}
¿Qué vende? ${g(v,'bi-vende')}
¿Por qué nació? ${g(v,'bi-origen')}
Problema que resuelve: ${g(v,'bi-problema')}
¿Qué la hace diferente? ${g(v,'bi-diferente')}
Visión: ${g(v,'bi-vision')} | Impacto: ${g(v,'bi-impacto')}
Emociones: ${g(v,'bi-emociones')} | Percepción deseada: ${g(v,'bi-percepcion')}
Admira: ${g(v,'bi-admira')} | NO quiere parecer: ${g(v,'bi-no-parecer')}
Personalidad: ${g(v,'bi-personalidad')} | Tono: ${g(v,'bi-tono')}
Palabras clave: ${g(v,'bi-palabras')} | Valores: ${g(v,'bi-valores')}
Filosofía: ${g(v,'bi-filosofia')} | Comunidad: ${g(v,'bi-comunidad')}
Arquetipo: ${g(v,'bi-arquetipo')}

ESTRUCTURA (exactamente estas 13 secciones en Markdown):
# Identidad_MASTER.md — ${g(v,'bi-nombre')}
## 01. ¿Qué es la marca?
## 02. Historia de la marca
## 03. Misión
## 04. Visión
## 05. Valores
## 06. Filosofía de marca
## 07. Manifiesto
## 08. Arquetipo de marca
## 09. Personalidad de marca
## 10. Voz y tono
## 11. Percepción deseada
## 12. Cultura de marca
## 13. Emociones que transmite

REGLAS: Ustedeo/voseo siempre. Frases directas. Profundidad estratégica. Sin hipérboles. Manifiesto poderoso. Palabras prohibidas: gurú, hack, viral, fórmula secreta, éxito garantizado. Al final: *${g(v,'bi-nombre')} · Identidad_MASTER.md · v1.0 · Documento de uso interno*`;
}

function buildPromptOferta(v) {
  return `Eres un estratega de ventas y posicionamiento especializado en negocios de servicio premium en Latinoamérica.

Con la siguiente información construye el documento completo "Oferta_MASTER.md". Profundidad real, sin frases de relleno.

DATOS:
Oferta: ${g(v,'of-nombre-oferta')} | Precio: ${g(v,'of-precio')} | Formato: ${g(v,'of-formato')}
Duración: ${g(v,'of-duracion')}
¿Qué incluye? ${g(v,'of-que-incluye')}
¿Qué NO incluye? ${g(v,'of-que-no-incluye')}
Resultado prometido: ${g(v,'of-resultado')}
¿Por qué ese precio? ${g(v,'of-por-que-ese-precio')}
Comparado con la competencia: ${g(v,'of-comparado')}
Objeciones principales: ${g(v,'of-objeciones')}
Respuestas a objeciones: ${g(v,'of-respuestas-obj')}
Para quién ES: ${g(v,'of-para-quien')}
Para quién NO ES: ${g(v,'of-para-quien-no')}
Proceso de venta: ${g(v,'of-proceso-venta')}

ESTRUCTURA:
# Oferta_MASTER.md
## 01. La oferta en una frase
## 02. Qué incluye exactamente
## 03. Qué NO incluye
## 04. Resultado prometido
## 05. Justificación del precio
## 06. Para quién ES esta oferta
## 07. Para quién NO ES
## 08. Objeciones y respuestas
## 09. Comparación con alternativas
## 10. Proceso de venta paso a paso
## 11. Copy de ventas sugerido

REGLAS: Ustedeo/voseo. Directo, sin rodeos. Sin promesas vacías. Al final: *Oferta_MASTER.md · v1.0 · Confidencial*`;
}

function buildPromptCliente(v) {
  return `Eres un experto en psicología del consumidor y marketing estratégico para negocios en Latinoamérica.

Con la siguiente información construye el documento completo "ClienteIdeal_MASTER.md". Perfil profundo, sin generalidades.

DATOS:
Avatar: ${g(v,'ci-nombre-avatar')} | Edad: ${g(v,'ci-edad')} | Género: ${g(v,'ci-genero')}
País: ${g(v,'ci-pais')} | Ocupación: ${g(v,'ci-ocupacion')} | Facturación: ${g(v,'ci-facturacion')}
Estado del negocio cuando llega: ${g(v,'ci-estado-negocio')}
Dolores principales: ${g(v,'ci-dolores')}
Miedos profundos: ${g(v,'ci-miedos')}
Deseos: ${g(v,'ci-deseos')}
Frustraciones con soluciones anteriores: ${g(v,'ci-frustraciones')}
Cómo decide comprar: ${g(v,'ci-como-decide')}
Dónde busca información: ${g(v,'ci-donde-busca')}
Cómo habla / lenguaje: ${g(v,'ci-lenguaje')}

ESTRUCTURA:
# ClienteIdeal_MASTER.md
## 01. Perfil demográfico
## 02. Estado del negocio cuando llega
## 03. Sus dolores reales
## 04. Sus miedos profundos
## 05. Lo que desea
## 06. Frustraciones con soluciones anteriores
## 07. Cómo toma decisiones de compra
## 08. Dónde busca y qué consume
## 09. Su lenguaje exacto
## 10. Cómo hablarle para conectar
## 11. Señales de que ES el cliente ideal
## 12. Señales de que NO ES el cliente ideal

REGLAS: Ustedeo/voseo. Específico, no genérico. Al final: *ClienteIdeal_MASTER.md · v1.0 · Confidencial*`;
}

function buildPromptMercado(v) {
  return `Eres un analista estratégico de mercado especializado en ecommerce y negocios digitales en Latinoamérica.

Con la siguiente información construye "Mercado_MASTER.md". Análisis real, sin datos inventados.

DATOS:
Mercado total: ${g(v,'mc-mercado-total')}
Problema del mercado: ${g(v,'mc-problema-mercado')}
Oportunidad real: ${g(v,'mc-oportunidad')}
Tendencias: ${g(v,'mc-tendencias')}
Competidores directos: ${g(v,'mc-competidores-directos')}
Competidores indirectos: ${g(v,'mc-competidores-indirectos')}
Diferenciador real: ${g(v,'mc-diferenciador-real')}
Posición en el mercado: ${g(v,'mc-posicion')}
Barreras de entrada: ${g(v,'mc-barreras')}

ESTRUCTURA:
# Mercado_MASTER.md
## 01. Panorama general del mercado
## 02. El problema que existe en el mercado
## 03. La oportunidad real
## 04. Tendencias relevantes
## 05. Competidores directos
## 06. Competidores indirectos
## 07. Análisis comparativo
## 08. Posicionamiento de la marca
## 09. Ventaja competitiva sostenible
## 10. Barreras de entrada
## 11. Riesgos y amenazas

REGLAS: Ustedeo/voseo. Basado en los datos entregados, sin inventar. Al final: *Mercado_MASTER.md · v1.0 · Confidencial*`;
}

function buildPromptBranding(v) {
  return `Eres un director de arte y estratega de marca con expertise en identidad visual y comunicación para marcas premium.

Con la siguiente información construye "Branding_MASTER.md". Sistema completo, sin generalidades.

DATOS:
Colores: ${g(v,'br-colores')}
Tipografía: ${g(v,'br-tipografia')}
Estilo visual: ${g(v,'br-estilo-visual')}
¿Qué NO debe tener visualmente? ${g(v,'br-que-no-visual')}
Referencias visuales: ${g(v,'br-referencias')}
Voz de la marca: ${g(v,'br-voz')}
Tono en diferentes contextos: ${g(v,'br-tono-copy')}
Palabras que SÍ usa: ${g(v,'br-palabras-uso')}
Palabras PROHIBIDAS: ${g(v,'br-palabras-no')}
Eslogan: ${g(v,'br-eslogan')}
Copy hero: ${g(v,'br-copy-hero')}

ESTRUCTURA:
# Branding_MASTER.md
## 01. Identidad visual — resumen
## 02. Paleta de colores
## 03. Tipografía
## 04. Estilo visual y principios
## 05. Lo que nunca debe aparecer visualmente
## 06. Referencias de inspiración
## 07. Voz de la marca
## 08. Tono por contexto
## 09. Vocabulario aprobado
## 10. Vocabulario prohibido
## 11. Copy hero y frases de posicionamiento
## 12. Guía rápida de aplicación

REGLAS: Ustedeo/voseo. Sistema coherente y usable. Al final: *Branding_MASTER.md · v1.0 · Confidencial*`;
}

function buildPromptVision(v) {
  return `Eres un estratega de crecimiento y planeamiento empresarial para negocios de servicios y consultoría en Latinoamérica.

Con la siguiente información construye "Vision_MASTER.md". Ambición real, metas concretas.

DATOS:
Visión 1 año: ${g(v,'vi-vision-1')}
Visión 3 años: ${g(v,'vi-vision-3')}
Visión largo plazo: ${g(v,'vi-vision-largo')}
Misión actual: ${g(v,'vi-mision')}
Impacto que quiere generar: ${g(v,'vi-impacto')}
Metas 6 meses: ${g(v,'vi-metas-6m')}
Metas 12 meses: ${g(v,'vi-metas-12m')}
Prioridades estratégicas ahora: ${g(v,'vi-prioridades')}
Obstáculos para crecer: ${g(v,'vi-obstaculos')}
Planes de expansión: ${g(v,'vi-expansion')}

ESTRUCTURA:
# Vision_MASTER.md
## 01. Misión — por qué existe el negocio
## 02. Visión — adónde va
## 03. Impacto deseado
## 04. Metas próximos 6 meses
## 05. Metas próximos 12 meses
## 06. Visión a 3 años
## 07. Visión a largo plazo
## 08. Prioridades estratégicas actuales
## 09. Obstáculos identificados
## 10. Hoja de ruta general
## 11. Planes de expansión

REGLAS: Ustedeo/voseo. Concreto y ambicioso pero realista. Al final: *Vision_MASTER.md · v1.0 · Confidencial*`;
}

function buildPromptOperacion(v) {
  return `Eres un consultor de operaciones y eficiencia empresarial especializado en negocios de servicios en crecimiento.

Con la siguiente información construye "Operacion_MASTER.md". Mapa operativo completo.

DATOS:
Equipo: ${g(v,'op-equipo')}
Herramientas / stack: ${g(v,'op-herramientas')}
Proceso con cliente: ${g(v,'op-proceso-cliente')}
Entregables: ${g(v,'op-entregables')}
Distribución del tiempo: ${g(v,'op-tiempo-semana')}
Cuellos de botella: ${g(v,'op-cuellos')}
SOPs existentes: ${g(v,'op-sops')}
Métricas internas: ${g(v,'op-metricas-op')}
Automatizaciones: ${g(v,'op-automatizaciones')}
Qué delegar primero: ${g(v,'op-que-delegar')}

ESTRUCTURA:
# Operacion_MASTER.md
## 01. Estructura del equipo
## 02. Stack tecnológico completo
## 03. Proceso cliente — de la venta a la entrega
## 04. Entregables por cliente
## 05. Distribución del tiempo semanal
## 06. Cuellos de botella identificados
## 07. SOPs existentes
## 08. Métricas de operación interna
## 09. Automatizaciones activas
## 10. Plan de delegación
## 11. Próximos pasos para escalar la operación

REGLAS: Ustedeo/voseo. Específico y accionable. Al final: *Operacion_MASTER.md · v1.0 · Confidencial*`;
}

function buildPromptIA(v) {
  return `Eres un arquitecto de sistemas de IA aplicada a negocios de servicios y ecommerce en Latinoamérica.

Con la siguiente información construye "IA_MASTER.md". Base de conocimiento estructurada para agentes de IA.

DATOS:
Uso actual de IA: ${g(v,'ia-usa-ia')}
Flujos automatizados: ${g(v,'ia-flujos')}
Oportunidades para IA: ${g(v,'ia-oportunidades')}
Limitaciones actuales: ${g(v,'ia-limitaciones')}
Contexto clave para agentes: ${g(v,'ia-contexto-clave')}
Reglas que el agente debe seguir: ${g(v,'ia-reglas-ia')}
Tareas para agentes: ${g(v,'ia-tareas-agentes')}
Prompt base actual: ${g(v,'ia-prompt-base')}
Datos que NUNCA debe revelar: ${g(v,'ia-datos-privados')}

ESTRUCTURA:
# IA_MASTER.md
## 01. Uso actual de IA en el negocio
## 02. Stack de automatización activo
## 03. Oportunidades prioritarias para IA
## 04. Limitaciones y restricciones
## 05. Contexto maestro para agentes de IA
## 06. Reglas de comportamiento para agentes
## 07. Tareas habilitadas para agentes
## 08. Prompt base del negocio
## 09. Información confidencial — nunca revelar
## 10. Hoja de ruta de implementación de IA
## 11. Métricas para medir el impacto de IA

REGLAS: Ustedeo/voseo. Técnico pero claro. Útil para alimentar agentes. Al final: *IA_MASTER.md · v1.0 · Confidencial*`;
}

