# CLAUDE.md — Villamo Growth
# app.villamogrowth.com · villamogrowth.com

> Contexto maestro para Claude Code. Leer completo antes de escribir cualquier línea de código.
> Este archivo une identidad de marca, metodología, branding, cliente ideal y arquitectura técnica de la app.
> Ante cualquier duda de diseño, copy, arquitectura o lógica — este archivo manda.

**Versión 3.0 · Mayo 2026 · Documento confidencial de uso interno**

---

## ÍNDICE

### PARTE I — MARCA Y PRODUCTO
1. Qué es la marca
2. Historia de la marca
3. Misión y Visión
4. Valores de marca
5. Filosofía de marca
6. Manifiesto
7. Arquetipo de marca
8. Personalidad de marca
9. Voz, tono y copy
10. Paleta de colores
11. Tipografía
12. Principios de diseño
13. Percepción deseada
14. Cliente ideal
15. La oferta — Programa 90 días
16. Los 6 pilares del sistema

### PARTE II — LA APP
17. Qué es app.villamogrowth.com
18. Roles de usuario
19. Pantallas y rutas
20. Métricas clave
21. Componentes UI frecuentes
22. Frases clave de la marca
23. Casos reales de referencia

### PARTE III — ARQUITECTURA TÉCNICA
24. Stack tecnológico
25. Estructura de carpetas
26. Regla core: `components/` vs `features/`
27. Gestión de estado — tres niveles
28. Gestión de tipos
29. Autenticación y roles (Supabase RLS)
30. Base de datos — esquema principal
31. Diseño responsivo y sistema visual
32. Internacionalización (i18n)
33. Manejo de errores y estados de carga
34. Testing
35. Comportamiento del código — reglas de escritura
36. Lo que nunca se hace
37. Checklist antes de entregar

---

# PARTE I — MARCA Y PRODUCTO

---

## 01. QUÉ ES LA MARCA

Villamo Growth es un sistema de implementación ecommerce para marcas con producto físico que ya venden, pero siguen operando desde el caos.

No es una agencia de publicidad que vive del presupuesto de pauta del cliente. No es un curso que enseña teoría y deja al dueño solo con un PDF y buena suerte. No es una consultora que entrega recomendaciones y se va.

> **Villamo Growth es estructura.**

La marca ocupa un espacio muy específico: el espacio entre el negocio que ya funciona y el negocio que realmente escala. Ese espacio está lleno de dueños que facturan, que tienen producto real, que tienen clientes reales, pero que siguen respondiendo WhatsApp a las 11 de la noche porque si paran, el negocio para.

Villamo Growth combina metodología, tecnología y ejecución directa para transformar operaciones desordenadas en ecommerce profesionales, medibles y listos para escalar. Sin prometer magia. Sin inflar resultados.

### Lo que NO es
- No es agencia de publicidad que vive de presupuesto de pauta
- No vende cursos genéricos ni fórmulas mágicas
- No trabaja con dropshipping ni modelos sin marca propia
- No promete números inflados ni casos de éxito fabricados

---

## 02. HISTORIA DE LA MARCA

En 2019, Pablo Villamo vendió su primer producto online. Cámaras instantáneas. Instax Mini 11. Sin saber nada de ventas. Sin saber nada de marketing. Sin sistema. Sin mentor.

Vendía por Marketplace. Respondía mensajes todo el día. Empacaba pedidos con sus propias manos. Voluntad y decisión de aprender en el camino.

Luego llegó 2020. Pandemia. El mundo cambió las reglas. Y ahí ocurrió la revelación: emprender era aprender a adaptarse sin permiso y sin aviso previo. Empezó el aprendizaje real por necesidad operativa — Marketing, Shopify, automatizaciones, SEO, ROAS, psicología de compra — no como cursos, sino como conocimiento que se aprende porque si no, el negocio muere.

El negocio creció. Y con el crecimiento llegó la verdad incómoda:

> *Si él no respondía, no se vendía.*

Fue ahí donde la pregunta cambió: ya no era cómo vender más, sino cómo construir algo que no dependa de una sola persona para sobrevivir.

La respuesta llegó de conectar todo lo aprendido como sistema integrado: Shopify, posicionamiento orgánico, contenido estratégico, email marketing, automatizaciones, base de datos. No como herramientas separadas — como un ecosistema donde cada pieza potencia a las demás.

Funcionó. Y al mirar al mercado, el mismo problema se repetía en cientos de marcas latinoamericanas. Marcas con producto real, clientes reales, ventas reales — que, exactamente igual, operaban desde el caos porque nadie les había construido la estructura que necesitaban.

> *Vender está bien. Pero construir un negocio que no dependa completamente de uno — eso cambia todo.*

Villamo Growth nació para cerrar esa brecha.

---

## 03. MISIÓN Y VISIÓN

### Misión
Villamo Growth existe para transformar marcas físicas latinoamericanas que ya venden, pero siguen operando desde procesos manuales, dependencia del dueño y estructura desordenada, en ecommerce profesionales, automatizados y listos para escalar.

Lo hace a través de implementación directa: construyendo dentro del negocio del cliente el sistema completo de Shopify, conversión, automatización, SEO, contenido orgánico, email marketing, métricas y escalabilidad operativa.

> **La misión no es enseñar. No es asesorar. Es ejecutar.** Es dejar funcionando un negocio que antes dependía de una persona para que ahora dependa de un sistema.

### Visión
Convertirse en el referente latinoamericano en estructura y escalabilidad ecommerce para marcas con producto físico.

No construir una agencia más grande. Construir una infraestructura de crecimiento: una plataforma, una metodología y un ecosistema que centralice todo lo que un ecommerce necesita para operar con orden, automatización e inteligencia.

> **La visión más profunda es cambiar el estándar del ecommerce en la región. Que lo normal no sea improvisar. Que lo normal sea sistematizar.**

---

## 04. VALORES DE MARCA

### Honestidad sobre resultados
No promete lo que no puede garantizar. Le dice al cliente lo que necesita escuchar, no lo que quiere oír. Si el negocio tiene un problema estructural, se nombra. La honestidad es la base de cada relación con cada cliente.

### Sistemas antes que improvisación
La cultura rechaza la operación basada en intuición, urgencia y apagado de incendios. Cada decisión busca construir un proceso, no resolver un problema puntual. Los sistemas producen resultados repetibles.

### Claridad antes que complejidad
El ecommerce moderno tiene demasiados ruidos. Villamo Growth simplifica. Identifica lo que realmente mueve el negocio y construye sobre eso. La claridad es una ventaja competitiva.

### Ejecución antes que teoría
El conocimiento sin ejecución no vale nada. Villamo Growth no entrega estrategias para que el cliente las implemente solo. Entra al negocio y construye. La ejecución directa es lo que diferencia a la marca.

### Escalabilidad real
Crecer sin estructura no es crecer. Es caos con más volumen. Cada sistema, cada proceso, cada herramienta que se implementa tiene que poder soportar más volumen sin colapsar.

### Datos antes que opiniones
Las decisiones se toman con métricas reales. Tasa de conversión, ticket promedio, costo de adquisición, retorno de pauta, tráfico orgánico. Los números no mienten.

### Calidad sobre volumen
No trabaja con todos. Trabaja con los clientes correctos: marcas que ya venden, que tienen producto real y que entienden que crecer requiere estructura.

### Construcción a largo plazo
Cada sistema está pensado para durar y crecer. No se construyen soluciones rápidas que caducan. Se construye infraestructura.

---

## 05. FILOSOFÍA DE MARCA

Villamo Growth cree que la mayoría de los negocios no necesitan trabajar más duro. Necesitan mejores sistemas.

El esfuerzo no es el problema. El dueño que lleva tres años respondiendo mensajes a las 11 de la noche no fracasa por falta de esfuerzo. Fracasa porque todo ese esfuerzo no está canalizando a través de una estructura que lo multiplique.

Un ecommerce bien construido debería funcionar con cada vez menos dependencia del dueño. No porque el dueño no importe, sino porque su tiempo y energía deberían estar en decisiones estratégicas, no en procesos repetitivos.

**Sobre el crecimiento:** Escalar sin estructura es simplemente sufrir más. El volumen amplifica los problemas existentes. La estructura los resuelve.

**Sobre el servicio:** El cliente no debería tener que aprender para que el sistema funcione. Villamo Growth no enseña y deja. Construye y entrega. La responsabilidad de que el sistema quede funcionando es de Villamo Growth.

**Sobre la tecnología:** La IA, la automatización y el ecommerce moderno no son lujos para marcas grandes. Son herramientas disponibles para cualquier negocio que sepa usarlas correctamente.

---

## 06. MANIFIESTO

**Tu negocio vende. Lo sabemos.**

Tenés clientes reales. Tenés producto real. Tenés un equipo, aunque sea pequeño, que da todo para que las cosas funcionen.

El problema no es que no trabajás.

> **El problema es que todo depende de vos.**

Si parás, el negocio para. Si no respondés el chat, las ventas bajan. Si no pautás, el tráfico desaparece. Si te enfermás, todo se detiene.

Eso no es escalar. Es sobrevivir con más estrés.

En Latinoamérica hay miles de marcas exactamente en ese lugar. Marcas que podrían ser mucho más de lo que son hoy. Marcas que tienen producto, que tienen mercado, que tienen todo lo necesario para crecer, pero que siguen atrapadas en procesos manuales, chats sin fin y operaciones que no escalan.

Nosotros creemos que eso tiene solución. No con más pauta. No con un rediseño bonito. No con un curso de 12 módulos.

> **Con sistemas.**

Con una tienda Shopify que convierta visitas en ventas. Con automatizaciones que respondan, nutran y cierren mientras vos dormís. Con SEO que traiga tráfico real sin pagar por cada clic. Con contenido que posicione tu marca sin depender de publicidad constante. Con email que recupere carritos y retenga clientes. Con métricas que digan exactamente qué funciona y qué no.

Con un negocio que no dependa de vos para sobrevivir.

> **Entramos al negocio. Construimos el sistema. Y lo dejamos funcionando.**

La pregunta no es si podés tener un ecommerce bien estructurado.

> **La pregunta es cuánto te está costando no tenerlo.**

---

## 07. ARQUETIPO DE MARCA

Villamo Growth opera desde la combinación de dos arquetipos: **El Sabio** y **El Gobernante**.

### El Sabio
Es el motor intelectual. No vende promesas. Vende claridad. Entiende profundamente los problemas del mercado, ha recorrido el camino, ha visto qué funciona y qué no. Comunica desde ese conocimiento con una autoridad que no necesita gritar para ser escuchada.

El Sabio de Villamo Growth habla desde experiencia real operando negocios. Cuando dice que el problema de la mayoría de ecommerce es estructural, no lo dice porque lo leyó. Lo dice porque lo vio. Lo midió. Lo resolvió.

### El Gobernante
Es el motor ejecutivo. No solo entiende el problema: lo ordena. Construye sistemas. Establece estructura. Crea orden donde existe caos. No llega a dar recomendaciones. Llega a construir la infraestructura.

Esta combinación crea una marca que es al mismo tiempo profundamente inteligente y decisivamente ejecutiva. Que piensa bien y actúa bien. Que diagnostica con precisión y ejecuta con competencia.

La comunicación es desde la calma y la certeza. Sin urgencia forzada. Sin hype. Con la seguridad de alguien que sabe de qué está hablando porque lo ha construido con sus propias manos.

> *La percepción que debe generar es: "Esta persona sabe exactamente por qué mi negocio no escala. Y sabe cómo solucionarlo."*

---

## 08. PERSONALIDAD DE MARCA

Si Villamo Growth fuera una persona, sería un **arquitecto de sistemas**. No un vendedor. No un influencer. No un motivador. Un arquitecto.

Alguien que entra a un espacio, lo analiza con precisión, identifica lo que está fallando, diseña la solución correcta y la construye. Sin drama. Sin rodeos. Con competencia.

Esta persona habla poco y dice mucho. Cada palabra tiene peso porque está respaldada por experiencia real. No exagera. No infla. No promete lo que no puede garantizar.

Tiene energía tranquila y segura. No necesita convencer a gritos. La claridad de lo que dice es suficiente.

Es moderna sin ser frívola. Estratégica sin ser fría. Directa sin ser arrogante.

Su actitud frente a los problemas del cliente es de diagnóstico claro antes que de solución rápida. Primero entiende. Luego estructura. Luego ejecuta.

Su relación con el cliente es de transformación. El objetivo es que el cliente eventualmente no necesite depender de Villamo Growth para que su negocio funcione. Eso es una victoria, no una pérdida.

---

## 09. VOZ, TONO Y COPY

### Cómo habla
Directa. Sin rodeos. Sin relleno. Cada frase tiene un propósito. Cada palabra aporta algo. Si no aporta, no va.

La voz es segura pero no arrogante. Habla con autoridad porque la tiene, no porque quiere imponerse.

Usa **ustedeo y voseo** según el contexto. **Nunca tuteo.** El tuteo no encaja con el tono de autoridad y respeto profesional que la marca busca construir.

Es costarricense de origen, latinoamericana en alcance. Natural sin ser informal.

### Cómo escribe
Frases cortas. Párrafos concisos. Estructura limpia. No usa puntos suspensivos para crear intriga barata. No usa signos de exclamación para fingir energía. Escribe como piensa: con orden.

### Palabras que usa con frecuencia
`Sistemas` · `Estructura` · `Escalar` · `Conversión` · `Automatización` · `Implementación` · `Orden` · `Datos` · `Métricas` · `Ecommerce` · `Shopify` · `Proceso` · `Infraestructura` · `Claridad` · `Estrategia` · `Operación`

### Palabras prohibidas — nunca usar en la app
~~Transformación mágica~~ · ~~Éxito garantizado~~ · ~~Increíble~~ · ~~Fórmula secreta~~ · ~~Hack~~ · ~~Viral~~ · ~~Explosivo~~ · ~~Pasivo~~ · ~~Riqueza rápida~~ · ~~Gurú~~ · ~~Masterclass~~

Cualquier palabra que suene a curso de dropshipping o cuenta motivacional está prohibida.

### Tabla de tono — ejemplos en interfaz

| ✗ Evitar | ✓ Usar |
|----------|--------|
| "¡Transformá tu negocio y alcanzá el éxito!" | "Su negocio ya vende. El problema es que todo depende de usted para funcionar. Eso tiene solución." |
| "¡Aprende los secretos de las marcas exitosas!" | "No vendemos secretos. Vendemos sistemas. Y los construimos dentro de su negocio." |
| "¿Querés más ventas? ¡Nosotros te ayudamos!" | "Más ventas sin estructura solo producen más caos. Primero el sistema. Después el volumen." |
| "¡Completaste el módulo, increíble!" | "Módulo completado. El sistema sigue avanzando." |
| "¡Bienvenido al programa!" | "El programa arrancó. Acá empieza la estructura." |
| "¡Tus métricas están volando!" | "CR subió 0.3% este mes. El sistema está convirtiendo mejor." |

---

## 10. PALETA DE COLORES

Usar siempre estas variables CSS exactas. No inventar colores. No usar variantes no aprobadas.

```css
:root {
  /* Fondos */
  --color-bg: #0A0A0A;             /* Negro profundo — fondo dominante */
  --color-bg-secondary: #1A1A1A;   /* Fondos secundarios, capas, cards */
  --color-carbon: #2C2C2A;         /* Texto sobre fondo claro / hover de cards */

  /* Acento — verde solo donde importa */
  --color-green: #22C55E;          /* CTA, iconos, highlights, acento principal */
  --color-green-dark: #16A34A;     /* Hover de CTA, variante oscura */
  --color-green-light: #DCFCE7;    /* Badges positivos, tags de estado */

  /* Neutros */
  --color-white: #FFFFFF;          /* Texto sobre negro, espacios limpios */
  --color-cream: #F5F5F4;          /* Fondos claros, tarjetas, documentos */
  --color-gray: #888780;           /* Subtítulos, metadata, elementos secundarios */

  /* Estados */
  --color-error: #EF4444;          /* Errores, métricas negativas, destructivo */
  --color-warning: #F59E0B;        /* Alertas, pendiente, atención */
  --color-success: #22C55E;        /* Completado, positivo — mismo verde */
}
```

### Reglas de uso — irrompibles

| Contexto | Fondo | Acento | Texto primario | Texto secundario |
|----------|-------|--------|----------------|-----------------|
| App / Dashboard | `#0A0A0A` | `#22C55E` | `#FFFFFF` | `#888780` |
| Cards / Módulos | `#1A1A1A` | `#22C55E` | `#FFFFFF` | `#888780` |
| Hover de cards | `#2C2C2A` | `#22C55E` | `#FFFFFF` | `#888780` |
| Botones CTA | `#22C55E` | — | `#0A0A0A` | — |
| Hover de CTA | `#16A34A` | — | `#0A0A0A` | — |
| Badges positivos | `#DCFCE7` | — | `#16A34A` | — |
| Documentos / Email | `#F5F5F4` | `#16A34A` | `#2C2C2A` | `#888780` |

**Regla crítica:** Negro `#0A0A0A` en al menos el 70% de cualquier pantalla. Verde solo donde importa — CTA, datos clave, acentos, íconos de acento. **Nunca como fondo dominante.**

---

## 11. TIPOGRAFÍA

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --font-family: 'Inter', sans-serif;

  /* Escala tipográfica */
  --text-xs:   0.75rem;    /* 12px — metadata, captions */
  --text-sm:   0.875rem;   /* 14px — labels, botones pequeños */
  --text-base: 1rem;       /* 16px — cuerpo de texto */
  --text-lg:   1.125rem;   /* 18px — subtítulos */
  --text-xl:   1.25rem;    /* 20px — títulos de sección */
  --text-2xl:  1.5rem;     /* 24px — headings */
  --text-3xl:  1.875rem;   /* 30px — títulos principales */
  --text-4xl:  2.25rem;    /* 36px — hero, pantallas de impacto */

  /* Pesos */
  --font-regular:  400;
  --font-medium:   500;
  --font-semibold: 600;
  --font-bold:     700;

  /* Line heights */
  --leading-tight:  1.2;   /* Títulos */
  --leading-snug:   1.4;   /* Subtítulos */
  --leading-normal: 1.7;   /* Cuerpo */
}
```

**Reglas:**
- Jerarquía siempre por tamaño y peso — nunca por decoración
- Cero serif, cero scripts, cero decorativo
- El texto es el diseño — que respire, que sea legible
- Números en métricas y datos: `font-variant-numeric: tabular-nums`

---

## 12. PRINCIPIOS DE DISEÑO

1. **Minimalismo con impacto** — pocos elementos, mucho contraste
2. **Plano y limpio** — sin gradientes decorativos, sin sombras innecesarias
3. **Tipografía como protagonista** — el mensaje manda
4. **Verde solo como activador** — CTA, íconos de acento, datos clave, nunca fondo
5. **Línea divisora verde** `#22C55E` de 1px para separar secciones principales
6. **Borde izquierdo verde** de 3px para citas, frases clave y alertas importantes
7. **Iconografía outline/stroke** — trazo 1.5–2px, nunca relleno sólido (Tabler Icons)
8. **Mobile-first** — diseñar para 375px viewport y escalar hacia arriba
9. **Espaciado generoso** — respiración entre elementos, no amontonar información
10. **Estados claros** — completado / en progreso / pendiente deben ser visualmente inequívocos

### Animaciones y transiciones
- Sutiles y con propósito — nada decorativo sin función
- Transiciones de estado: `150ms ease` para hover, `200ms ease-out` para cambios de pantalla
- Hover states claros en todos los elementos interactivos
- Sin animaciones que bloqueen el flujo de trabajo
- Usar Framer Motion si está instalado en el proyecto; CSS transitions si no

---

## 13. PERCEPCIÓN DESEADA

### Visualmente
Villamo Growth debe verse como una marca moderna, minimalista y premium. Negro como base. Verde como activador. Sin ruidos visuales. Sin gradientes decorativos.

La percepción visual debe ser: **esto es una empresa seria con estética de tecnología moderna** — no una agencia de diseño ni una cuenta de contenido.

### Emocionalmente
Al interactuar con la app, el cliente debería sentir:

- **Claridad** — por primera vez alguien nombra exactamente el problema con precisión
- **Alivio** — el problema tiene solución, hay un camino claro
- **Confianza** — quien está del otro lado sabe lo que hace
- **Seguridad** — el dinero invertido va a construir algo real
- **Control** — el negocio va a depender menos de la improvisación
- **Dirección** — hay un norte claro, cada paso tiene propósito

Lo que Villamo Growth **nunca** debería generar: euforia vacía, urgencia artificial ni esperanza sin fundamento.

### Comercialmente
Debe percibirse como una inversión, no como un gasto.

> *"Esto es caro, pero entiendo exactamente qué voy a obtener y por qué vale lo que cuesta."*

---

## 14. CLIENTE IDEAL

### Quién es
Dueño o dueña de marca con producto físico en Latinoamérica. Moda, calzado, joyería, lentes, accesorios. Con 1 a 5 años operando. Ya vende. Ya tiene clientes reales. El problema es que todo depende de él/ella.

### Los 4 estados en los que llega

| # | Estado | Descripción |
|---|--------|-------------|
| 01 | **Tiene audiencia pero no sistema** | Seguidores, comunidad construida. Pero cada venta pasa por el chat. La dueña es el cuello de botella de cada transacción. |
| 02 | **Tiene potencial pero no estructura** | El producto es bueno, hay intención de compra, pero no existe el ecosistema digital para convertirlo en ventas reales. Sin web, sin datos, sin flujos. |
| 03 | **Tiene tráfico pero no conversión** | Invierte en pauta, tiene visitas, pero la tienda no convierte. Le vendieron aplicaciones que no resolvieron el problema de fondo. |
| 04 | **Tiene ecommerce pero sigue en el chat** | Tiene Shopify, tiene página web, pero las ventas siguen cerrando por mensajes. No logró migrar la operación hacia un sistema que venda solo. |

### Sus dolores reales
- Responde mensajes todo el día y siente que si para un momento, pierde ventas
- Sabe que el negocio depende demasiado de él o de ella para funcionar
- Invirtió en pauta y perdió plata sin entender exactamente por qué
- Alguien le cobró por soluciones que no resolvieron nada — aplicaciones, agencias, cursos
- Factura, pero a fin de mes no entiende bien a dónde fue el dinero
- Quiere escalar pero tiene miedo de que más volumen signifique más caos

### Sus objeciones más comunes

| Objeción | Respuesta de la marca |
|----------|----------------------|
| *"Ya intenté con una agencia y no funcionó."* | Esto no es una agencia. Es implementación directa con resultados medibles. |
| *"No sé si mi negocio está listo para esto."* | Si ya tiene producto y ya vende, está listo. El desorden cuesta más que la inversión. |
| *"$3,000 es mucho dinero."* | No ha calculado cuánto le está costando operar sin sistemas: tiempo, ventas perdidas, pauta quemada. |
| *"No tengo tiempo para implementar cambios ahora."* | La implementación la hace Villamo Growth, no el cliente. |
| *"¿Y si no funciona para mi tipo de producto?"* | Ha funcionado en joyería, calzado, lentes, botellas, cosméticos. |

### Para quién NO es
- Personas buscando dinero rápido o resultados sin proceso
- Dropshipping o modelos sin marca propia
- Negocios sin producto real ni demanda validada
- Quien no está dispuesto a comprometerse con la implementación

---

## 15. LA OFERTA — PROGRAMA 90 DÍAS

**$3,000 USD — Implementación directa, no consultoría**

### Mapa del programa

```
FASE 1 — Días 1–15: Diagnóstico y base
  ├── 01. Auditoría inicial
  │       Diagnóstico completo — cuellos de botella, fugas de conversión, oportunidades reales
  └── 02. Shopify optimizado
          Creación o reestructuración de la tienda con foco en conversión, no solo en diseño

FASE 2 — Días 16–60: Construcción del sistema
  ├── 03. Optimización de conversión
  │       Estructura de producto, flujo de compra, velocidad y confianza
  ├── 04. Automatizaciones ManyChat
  │       El negocio responde, nutre y cierra ventas sin depender del chat manual
  └── 05. SEO ecommerce
          Estructura base para tráfico orgánico y reducir dependencia de pauta pagada

FASE 3 — Días 61–90: Sistema completo y escala
  ├── 06. Contenido orgánico
  │       Sistema de contenido que posiciona la marca y atrae clientes sin anuncios
  ├── 07. Email marketing
  │       Flujos automatizados para recuperar carritos, retener clientes, ventas recurrentes
  ├── 08. Métricas y análisis
  │       Panel de datos claro para decisiones basadas en números, no intuición
  └── 09. Escalabilidad
          Sistema replicable con procesos definidos y base sólida para crecer sin caos
```

**Resultado al día 90:** Se acabó el caos. Se acabaron los chats sin fin, la dependencia de pauta, los procesos que dependen de una sola persona. El negocio vende con sistemas, no con esfuerzo.

---

## 16. LOS 6 PILARES DEL SISTEMA

Estos son los 6 ejes que estructuran toda la metodología. La app los refleja en navegación, métricas y seguimiento.

### Pilar 01 — Conversión
**Objetivo:** Convertir visitas en compradores sin fricción
- Estructura de página de producto, velocidad, checkout, señales de confianza, mobile-first, copywriting, upsells
- **Resultado esperado:** Tasa de conversión 1.5%–3%

### Pilar 02 — Automatización
**Objetivo:** El negocio responde, nutre y vende sin intervención manual
- Flujos ManyChat, keyword triggers, integración ManyChat + Shopify, email flows completos
- **Resultado esperado:** −70% tiempo en atención manual, ventas 24/7

### Pilar 03 — Tráfico
**Objetivo:** Atraer compradores con intención sin depender de pauta
- SEO técnico + SEO de producto + SEO de colecciones, contenido orgánico en Instagram/TikTok
- **Resultado esperado:** Tráfico orgánico sostenible en 3–6 meses

### Pilar 04 — Captación de Datos
**Objetivo:** Construir activos propios que el negocio controla
- Lista de email, audiencias de retargeting, pixels, captura en checkout, lead magnets
- **Resultado esperado:** Base de datos propia y creciente, canal de email predecible

### Pilar 05 — Análisis
**Objetivo:** Tomar decisiones con datos, no con intuición
- GA4, Shopify Analytics, dashboard de métricas (CR, AOV, LTV, CAC, ROAS)
- **Resultado esperado:** Panel de métricas semanales, claridad total sobre qué funciona

### Pilar 06 — Escalamiento
**Objetivo:** Crecer sin volver al caos
- Documentación de procesos (SOPs), stack tecnológico definido, delegación, proyección 6–12 meses
- **Resultado esperado:** Procesos documentados, hoja de ruta clara, base para crecer

---

# PARTE II — LA APP

---

## 17. QUÉ ES APP.VILLAMOGROWTH.COM

Una plataforma interna de gestión y seguimiento del programa de 90 días.

**No es un landing page. No es un portal bonito. Es una herramienta real de trabajo.**

Cada pantalla debe sentirse como un dashboard funcional — datos a la vista, acciones claras, sin decoración innecesaria. La app refleja la misma filosofía de la marca: orden, claridad, sistemas.

**El problema que resuelve:** Sin la app, el seguimiento del programa ocurre por WhatsApp, email y documentos dispersos. Con la app, tanto Pablo como el cliente tienen visibilidad total del proceso, el progreso y los recursos — en un solo lugar, en tiempo real.

---

## 18. ROLES DE USUARIO

### 🔵 Administrador — Pablo (Villamo Growth)
El consultor que entrega el programa. Acceso total a todos los clientes.

**Puede hacer:**
- Ver todos los clientes activos y su progreso
- Actualizar el estado de cada módulo por cliente (completado / en progreso / pendiente)
- Subir recursos, entregables y documentos por cliente y módulo
- Registrar notas internas (visibles solo para el admin)
- Ver y cargar métricas de cada cliente
- Gestionar onboarding de clientes nuevos
- Publicar actualizaciones y comunicaciones para el cliente
- Asignar fecha de inicio y calcular automáticamente el timeline de 90 días

**No puede hacer un cliente:**
- Ver datos de otros clientes
- Acceder a notas internas del admin
- Modificar el estado de sus módulos

### 🟢 Cliente — Dueño de marca
El dueño de la marca que contrató el programa. Ve solo su propio espacio.

**Puede hacer:**
- Ver su progreso (fase actual, módulos completados, días transcurridos)
- Ver el estado de cada módulo con descripción de qué se está trabajando
- Acceder a recursos y entregables de su programa
- Consultar sus métricas clave
- Leer actualizaciones y comunicaciones de Pablo
- Completar checklists asignados
- Ver su timeline de 90 días y fechas clave

**No puede hacer:**
- Modificar el estado de sus módulos
- Ver datos de otros clientes
- Acceder a secciones admin

---

## 19. PANTALLAS Y RUTAS

### Rutas del cliente
```
/                       → Redirect a /dashboard (autenticado) o /login
/login                  → Pantalla de autenticación
/dashboard              → Progreso, días transcurridos, módulo activo, métricas clave
/programa               → Las 3 fases y 9 módulos con estado de cada uno
/metricas               → Panel CR, AOV, LTV, CAC, ROAS con evolución temporal
/recursos               → Documentos y entregables organizados por módulo/fase
/actualizaciones        → Feed de novedades y comunicaciones de Pablo
/checklist              → Checklists operativos asignados (semanal/mensual)
```

### Rutas del administrador
```
/admin                            → Dashboard con todos los clientes activos
/admin/clientes                   → Lista de clientes, estado, fase, días restantes
/admin/onboarding                 → Formulario para crear cliente nuevo
/admin/cliente/[id]               → Vista detallada del cliente — resumen completo
/admin/cliente/[id]/programa      → Gestión de módulos y estado por fase
/admin/cliente/[id]/metricas      → Carga y edición de métricas del cliente
/admin/cliente/[id]/recursos      → Subida y organización de entregables
/admin/cliente/[id]/notas         → Notas internas del consultor (privadas)
/admin/cliente/[id]/comunicaciones → Publicar actualizaciones para el cliente
```

---

## 20. MÉTRICAS CLAVE EN LA APP

### Métricas principales — siempre visibles en el dashboard

| Sigla | Nombre completo | Descripción |
|-------|----------------|-------------|
| **CR** | Tasa de Conversión | % de visitas que completan una compra |
| **AOV** | Ticket Promedio | Valor promedio por pedido (Average Order Value) |
| **LTV** | Valor del Cliente | Cuánto genera un cliente en el tiempo (Lifetime Value) |
| **CAC** | Costo de Adquisición | Cuánto cuesta conseguir un cliente |
| **ROAS** | Retorno en Pauta | Retorno por cada dólar invertido en publicidad |

### Métricas secundarias
- Sesiones / tráfico total por período
- % de tráfico orgánico vs pagado
- Tasa de abandono de carrito
- Tasa de clientes recurrentes vs nuevos
- Apertura y conversión de email flows
- Seguidores orgánicos (si aplica al caso)

### Lógica de visualización de variaciones
- Variación positiva vs período anterior → verde `#22C55E` con flecha ↑
- Variación negativa vs período anterior → rojo `#EF4444` con flecha ↓
- Sin dato previo → gris `#888780` con "—"

---

## 21. COMPONENTES UI FRECUENTES

### Tarjeta de módulo
```
┌─────────────────────────────────────┐
│ 01                      [En curso]  │  ← Número en verde, badge de estado
│ Auditoría inicial                   │  ← Nombre en blanco bold
│ Diagnóstico completo del negocio —  │  ← Descripción en gris, 2 líneas máx
│ cuellos de botella y oportunidades  │
│                          FASE 1 ›   │  ← Fase en gris pequeño, alineado derecha
└─────────────────────────────────────┘
```
Estados del badge:
- `Completado` → fondo `#DCFCE7`, texto `#16A34A`
- `En curso` → fondo `#22C55E` con pulso sutil, texto `#0A0A0A`
- `Pendiente` → fondo `#1A1A1A`, texto `#888780`, borde `#2C2C2A`

### Card de métrica
```
┌──────────────────┐
│ CR               │  ← Sigla en verde, pequeña
│ 1.8%             │  ← Valor en blanco bold grande (tabular-nums)
│ ↑ +0.3%          │  ← Variación en verde/rojo
│ vs. mes anterior │  ← Label en gris xs
└──────────────────┘
```

### Barra de progreso de 90 días
```
Día 1        Día 15      Día 60                Día 90
  ●────────────●────────────●──────────────────────○
  FASE 1      FASE 2       FASE 3
  Completada  En curso     Pendiente

  Día 34 de 90  ·  FASE 2 activa  ·  56 días restantes
```

### Borde izquierdo para frases clave
```css
.quote-block {
  border-left: 3px solid var(--color-green);
  padding-left: 1rem;
  color: var(--color-white);
  font-style: italic;
}
```

### Tabla de clientes (admin)
Columnas: Logo/iniciales · Nombre de marca · Día actual (ej: "34/90") · Fase activa · Último módulo completado · Acceso rápido →

---

## 22. FRASES CLAVE DE LA MARCA

Para encabezados, empty states, onboarding y pantallas de impacto. Nunca en botones ni labels de interfaz.

> "Su negocio no necesita más esfuerzo. Necesita mejores sistemas."

> "El problema no es que no trabajás duro. El problema es que seguís dependiendo de vos mismo para que todo funcione."

> "Un sistema imperfecto funcionando vale más que una idea perfecta en pausa."

> "Crecer rápido sin estructura no es éxito, es caos con más volumen."

> "El desorden cuesta mucho más que $3,000."

> "Al terminar los 90 días se acaba el caos."

> "No prometemos resultados mágicos. Construimos el sistema. Y lo dejamos funcionando."

> "Más ventas sin estructura solo producen más caos. Primero el sistema. Después el volumen."

> "Los negocios latinoamericanos no fracasan por falta de producto. Fracasan por falta de estructura."

> "La pregunta no es si podés tener un ecommerce bien estructurado. La pregunta es cuánto te está costando no tenerlo."

---

## 23. CASOS REALES DE REFERENCIA

Estos son los únicos ejemplos reales a usar en copy, onboarding y demos. **No inventar casos ni métricas.**

| Caso | Problema inicial | Resultado |
|------|-----------------|-----------|
| **Joyería costarricense** | 10K seguidores. Ventas 100% dependientes de la dueña. Todo por chat. Sin automatizaciones. | Restructuración completa. Shopify + automatizaciones activas. Crecimiento de más de 3X en facturación online. |
| **Calzado femenino** | Desde cero. Sin web, sin seguidores, sin estrategia digital. | En 5 meses: 7K seguidores orgánicos, base de datos sólida, flujos automatizados activos, facturación online considerable. |
| **Tienda de lentes** | Tráfico constante pero conversión extremadamente baja. Apps innecesarias. Perdía plata con pauta. | Conversión subió a 1.5%. Eliminación de costos innecesarios. SEO implementado. Operación rentable. |
| **Marca de botellas** | Shopify existente pero ventas siguiendo por chat. Atención manual 100%. | Migración completa del chat al sistema web. Procesos automatizados. Operación escalable. |

---

# PARTE III — ARQUITECTURA TÉCNICA

---

## 24. STACK TECNOLÓGICO

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14+ (App Router) |
| Lenguaje | TypeScript 5+ (strict, end to end) |
| Estilos | Tailwind CSS v3 + CSS custom properties de marca |
| Componentes UI | shadcn/ui |
| Base de datos | Supabase (PostgreSQL + Auth + RLS + Storage) |
| Validación | Zod |
| Estado servidor | TanStack Query (React Query) |
| Estado cliente | Zustand |
| Iconos | Tabler Icons — siempre outline/stroke, nunca filled |
| Fuentes | Inter via `next/font/google` |
| Animaciones | Framer Motion (si ya está instalado) / CSS transitions si no |
| Email transaccional | Resend |
| Deploy | Vercel |
| Package manager | **pnpm** — nunca npm ni yarn |

**Comandos:**
```bash
pnpm install    # instalar dependencias
pnpm dev        # desarrollo local
pnpm build      # build de producción
pnpm lint       # linting
pnpm type-check # verificar tipos sin build
```

### Tailwind — configuración de colores de marca
```js
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './features/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:            '#0A0A0A',
          'bg-secondary':'#1A1A1A',
          carbon:        '#2C2C2A',
          green:         '#22C55E',
          'green-dark':  '#16A34A',
          'green-light': '#DCFCE7',
          white:         '#FFFFFF',
          cream:         '#F5F5F4',
          gray:          '#888780',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    }
  }
}

export default config
```

---

## 25. ESTRUCTURA DE CARPETAS

```
villamo-growth/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx                  # Pantalla de login — pública
│   │
│   ├── (cliente)/                          # Role=cliente — layout con sidebar cliente
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx              # CSR · resumen, progreso, métricas
│   │   ├── programa/page.tsx               # CSR · fases y módulos
│   │   ├── metricas/page.tsx               # CSR · panel CR, AOV, LTV, CAC, ROAS
│   │   ├── recursos/page.tsx               # CSR · documentos y entregables
│   │   ├── actualizaciones/page.tsx        # CSR · feed de comunicaciones
│   │   └── checklist/page.tsx              # CSR · checklists operativos
│   │
│   ├── (admin)/                            # Role=admin — layout con sidebar admin
│   │   ├── layout.tsx
│   │   ├── admin/page.tsx                  # CSR · dashboard de todos los clientes
│   │   ├── admin/clientes/page.tsx         # CSR · lista de clientes
│   │   ├── admin/onboarding/page.tsx       # CSR · crear cliente nuevo
│   │   └── admin/cliente/
│   │       └── [id]/
│   │           ├── page.tsx                # Resumen completo del cliente
│   │           ├── programa/page.tsx       # Gestión de módulos y estado
│   │           ├── metricas/page.tsx       # Carga y edición de métricas
│   │           ├── recursos/page.tsx       # Subida de entregables
│   │           ├── notas/page.tsx          # Notas internas (solo admin)
│   │           └── comunicaciones/page.tsx # Publicar actualizaciones
│   │
│   ├── api/
│   │   ├── auth/[...]/route.ts
│   │   ├── clientes/route.ts
│   │   ├── clientes/[id]/route.ts
│   │   ├── modulos/route.ts
│   │   ├── metricas/route.ts
│   │   ├── recursos/route.ts
│   │   ├── notas/route.ts
│   │   └── comunicaciones/route.ts
│   │
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/               # Primitivas sin lógica de negocio (shadcn/ui)
│   ├── layout/           # Estructura de página (Sidebar, Navbar, Footer)
│   └── features/         # Componentes con lógica de dominio
│       ├── programa/     # ModuloCard, FaseHeader, ProgressBar90Dias
│       ├── metricas/     # MetricCard, MetricChart, MetricTable
│       ├── recursos/     # RecursoItem, RecursoUploader
│       ├── clientes/     # ClienteCard, ClienteTable (admin)
│       └── checklist/    # ChecklistItem, ChecklistSection
│
├── features/             # Lógica de dominio — sin JSX
│   ├── programa/
│   │   ├── programa.schema.ts    # Zod schemas
│   │   ├── programa.api.ts       # Llamadas al backend
│   │   ├── programa.hooks.ts     # React Query hooks
│   │   └── programa.types.ts    # Tipos del dominio
│   ├── metricas/
│   │   ├── metricas.schema.ts
│   │   ├── metricas.api.ts
│   │   ├── metricas.hooks.ts
│   │   └── metricas.types.ts
│   ├── clientes/
│   │   ├── clientes.schema.ts
│   │   ├── clientes.api.ts
│   │   ├── clientes.hooks.ts
│   │   └── clientes.types.ts
│   ├── recursos/
│   │   ├── recursos.schema.ts
│   │   ├── recursos.api.ts
│   │   ├── recursos.hooks.ts
│   │   └── recursos.types.ts
│   ├── comunicaciones/
│   │   ├── comunicaciones.schema.ts
│   │   ├── comunicaciones.api.ts
│   │   ├── comunicaciones.hooks.ts
│   │   └── comunicaciones.types.ts
│   └── auth/
│       ├── auth.schema.ts
│       ├── auth.api.ts
│       ├── auth.hooks.ts
│       └── auth.types.ts
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts     # Browser client
│   │   └── server.ts     # Server client (API Routes / SSR)
│   ├── constants.ts      # Estados de módulo, fases, roles, valores fijos
│   └── utils.ts          # cn(), formatDate(), formatCurrency(), calcDiasPrograma()
│
├── stores/               # Estado global cliente (Zustand)
│   ├── ui.store.ts       # Estado de UI — sidebar abierto, tema, etc.
│   └── filtros.store.ts  # Filtros activos en vistas de admin
│
├── hooks/                # Hooks genéricos reutilizables
│   ├── use-user.ts       # Usuario autenticado actual
│   └── use-debounce.ts
│
├── types/
│   ├── database.types.ts # Generado por Supabase CLI — nunca editar a mano
│   └── index.ts          # Tipos compartidos entre múltiples features
│
├── middleware.ts          # Auth + redirección por rol
├── .env.local            # Variables de entorno — nunca commitear
└── CLAUDE.md             # Este archivo
```

---

## 26. REGLA CORE: `components/` VS `features/`

Esta distinción es fundamental y no tiene excepciones.

- **`components/`** = _cómo se ve algo_. Recibe props, renderiza UI. Sin fetching, sin validación, sin lógica de negocio.
- **`features/`** = _qué hace algo y de dónde vienen sus datos_. Schemas, llamadas al backend, hooks, tipos del dominio. Sin JSX.

**Un componente nunca hace fetching directamente.** Llama a un hook de su feature.

### Patrón fijo por feature

Cada dominio bajo `features/` tiene siempre **los mismos cuatro archivos**:

```
features/<dominio>/
  <dominio>.schema.ts   # Zod — validación de entrada y salida
  <dominio>.api.ts      # Funciones async que llaman al backend
  <dominio>.hooks.ts    # React Query hooks que consumen .api.ts
  <dominio>.types.ts    # Tipos específicos del dominio
```

Esta repetición predecible es intencional: cualquier persona sabe dónde buscar sin preguntar.

### Ejemplo correcto

```tsx
// ✓ CORRECTO — componente consume hook
// components/features/metricas/MetricCard.tsx
import { useMetricasCliente } from '@/features/metricas/metricas.hooks'

export function MetricCard({ clienteId }: { clienteId: string }) {
  const { data, isLoading } = useMetricasCliente(clienteId)
  if (isLoading) return <MetricCardSkeleton />
  return <div>...</div>
}

// ✗ INCORRECTO — componente fetchea directamente
export function MetricCard({ clienteId }: { clienteId: string }) {
  const [data, setData] = useState(null)
  useEffect(() => { fetch(`/api/metricas/${clienteId}`).then(...) }, [])
  // NUNCA HACER ESTO
}
```

---

## 27. GESTIÓN DE ESTADO — TRES NIVELES

Decidir dónde vive un estado con estas preguntas, en orden:

1. **¿Viene del servidor?** (clientes, módulos, métricas, recursos) → **React Query**. No es estado, es caché de datos del servidor. Maneja fetching, caché e invalidación.

2. **¿Lo necesitan componentes que no son padre-hijo?** → **Zustand**. Solo para estado cliente compartido: sidebar abierto, filtros activos en la tabla de clientes del admin.

3. **De lo contrario** → `useState` local. Vive y muere en el componente.

**Nunca poner datos del servidor en Zustand. Nunca subir a un store algo que solo usa un componente.**

```ts
// stores/filtros.store.ts
import { create } from 'zustand'

interface FiltrosStore {
  faseActiva: string | null
  setFaseActiva: (fase: string | null) => void
}

export const useFiltrosStore = create<FiltrosStore>((set) => ({
  faseActiva: null,
  setFaseActiva: (fase) => set({ faseActiva: fase }),
}))
```

---

## 28. GESTIÓN DE TIPOS

Un tipo se define en **un solo lugar**. Nunca se copia. Tres ubicaciones según el alcance:

1. **Rows de base de datos** → `types/database.types.ts` (generado por Supabase CLI, nunca editar a mano). Los tipos del dominio se derivan de aquí:
   ```ts
   import type { Database } from '@/types/database.types'
   export type Cliente = Database['public']['Tables']['clientes']['Row']
   export type Modulo = Database['public']['Tables']['modulos']['Row']
   ```

2. **Tipos de un solo dominio** → `features/<dominio>/<dominio>.types.ts`
   (ej: `ModuloConEstado`, `MetricasResumen`). Ningún otro feature los importa.

3. **Tipos usados por dos o más features** → `types/index.ts`
   (ej: `RolUsuario`, `EstadoModulo`, `FasePrograma`). Fuente única de verdad — todos importan desde ahí.

**Pregunta de decisión:** ¿Lo usa más de un feature? Sí → `types/index.ts`. No → el feature. ¿Es un row de DB? → derivarlo de `database.types.ts`.

Si un tipo del feature empieza a ser necesario en otro feature, se **mueve** a `types/index.ts` y se actualizan las importaciones. Nunca se duplica.

```ts
// types/index.ts — tipos compartidos
export type RolUsuario = 'admin' | 'cliente'

export type EstadoModulo = 'completado' | 'en_progreso' | 'pendiente'

export type FasePrograma = {
  numero: 1 | 2 | 3
  nombre: string
  diasInicio: number
  diasFin: number
}

export const FASES: FasePrograma[] = [
  { numero: 1, nombre: 'Diagnóstico y base',         diasInicio: 1,  diasFin: 15 },
  { numero: 2, nombre: 'Construcción del sistema',   diasInicio: 16, diasFin: 60 },
  { numero: 3, nombre: 'Sistema completo y escala',  diasInicio: 61, diasFin: 90 },
]
```

---

## 29. AUTENTICACIÓN Y ROLES (SUPABASE RLS)

### Middleware — redirección por rol

```ts
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Sin sesión → login
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const rol = session.user.user_metadata?.rol as RolUsuario

  // Cliente intenta acceder a rutas de admin
  if (req.nextUrl.pathname.startsWith('/admin') && rol !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Admin va a rutas de cliente → redirigir a admin
  if (!req.nextUrl.pathname.startsWith('/admin') && rol === 'admin') {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
}
```

### RLS — políticas críticas

**Un cliente nunca puede ver datos de otro cliente.** Las políticas de Row Level Security de Supabase son la última línea de defensa.

```sql
-- Política: cliente solo ve sus propios datos
CREATE POLICY "cliente_solo_sus_datos"
ON clientes FOR SELECT
USING (auth.uid() = user_id);

-- Política: admin ve todos los clientes
CREATE POLICY "admin_ve_todo"
ON clientes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM perfiles
    WHERE perfiles.user_id = auth.uid()
    AND perfiles.rol = 'admin'
  )
);

-- Política: cliente solo ve sus métricas
CREATE POLICY "cliente_solo_sus_metricas"
ON metricas FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM clientes
    WHERE clientes.id = metricas.cliente_id
    AND clientes.user_id = auth.uid()
  )
);
```

**Regla de código:** Nunca confiar solo en el middleware o en la UI para proteger datos. Las políticas RLS de Supabase siempre están activas y son la fuente de verdad de permisos.

---

## 30. BASE DE DATOS — ESQUEMA PRINCIPAL

```sql
-- Perfiles de usuario (extiende auth.users de Supabase)
CREATE TABLE perfiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  rol         TEXT NOT NULL CHECK (rol IN ('admin', 'cliente')),
  nombre      TEXT NOT NULL,
  email       TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Clientes del programa
CREATE TABLE clientes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nombre_marca     TEXT NOT NULL,
  nombre_contacto  TEXT NOT NULL,
  email            TEXT NOT NULL,
  fecha_inicio     DATE NOT NULL,
  fecha_fin        DATE GENERATED ALWAYS AS (fecha_inicio + INTERVAL '90 days') STORED,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- Módulos del programa (9 módulos fijos)
CREATE TABLE modulos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id   UUID REFERENCES clientes(id) ON DELETE CASCADE,
  numero       INT NOT NULL CHECK (numero BETWEEN 1 AND 9),
  estado       TEXT NOT NULL DEFAULT 'pendiente'
               CHECK (estado IN ('completado', 'en_progreso', 'pendiente')),
  notas_admin  TEXT,           -- Visible solo para admin
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (cliente_id, numero)
);

-- Métricas por período
CREATE TABLE metricas (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id   UUID REFERENCES clientes(id) ON DELETE CASCADE,
  periodo      DATE NOT NULL,             -- Primer día del período (ej: 2026-05-01)
  cr           DECIMAL(5,2),              -- Tasa de conversión en %
  aov          DECIMAL(10,2),             -- Ticket promedio en USD
  ltv          DECIMAL(10,2),             -- Lifetime value en USD
  cac          DECIMAL(10,2),             -- Costo de adquisición en USD
  roas         DECIMAL(5,2),              -- Retorno en pauta
  sesiones     INT,                       -- Tráfico total del período
  organico_pct DECIMAL(5,2),             -- % de tráfico orgánico
  abandono_pct DECIMAL(5,2),             -- % abandono de carrito
  notas        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (cliente_id, periodo)
);

-- Recursos y entregables
CREATE TABLE recursos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id   UUID REFERENCES clientes(id) ON DELETE CASCADE,
  modulo_num   INT CHECK (modulo_num BETWEEN 1 AND 9),  -- NULL = general
  nombre       TEXT NOT NULL,
  descripcion  TEXT,
  url          TEXT NOT NULL,            -- URL de Supabase Storage
  tipo         TEXT NOT NULL CHECK (tipo IN ('documento', 'video', 'enlace', 'entregable')),
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Comunicaciones (actualizaciones del admin para el cliente)
CREATE TABLE comunicaciones (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id   UUID REFERENCES clientes(id) ON DELETE CASCADE,
  titulo       TEXT NOT NULL,
  contenido    TEXT NOT NULL,
  leido        BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Notas internas del admin (no visibles para el cliente)
CREATE TABLE notas_admin (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id   UUID REFERENCES clientes(id) ON DELETE CASCADE,
  contenido    TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Checklists operativos
CREATE TABLE checklists (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id   UUID REFERENCES clientes(id) ON DELETE CASCADE,
  titulo       TEXT NOT NULL,
  tipo         TEXT NOT NULL CHECK (tipo IN ('semanal', 'mensual', 'unico')),
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE checklist_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id  UUID REFERENCES checklists(id) ON DELETE CASCADE,
  descripcion   TEXT NOT NULL,
  completado    BOOLEAN DEFAULT false,
  orden         INT NOT NULL
);
```

---

## 31. DISEÑO RESPONSIVO Y SISTEMA VISUAL

### Breakpoints (Tailwind por defecto)
```
sm:   640px   → Teléfono horizontal / tablet pequeña
md:   768px   → Tablet
lg:   1024px  → Desktop pequeño
xl:   1280px  → Desktop estándar
2xl:  1536px  → Desktop grande
```

### Mobile-first — obligatorio
- Diseñar para 375px viewport y escalar hacia arriba
- Sidebar en mobile: drawer/panel deslizable desde la izquierda
- Cards de módulos: una columna en mobile, dos en tablet, tres en desktop
- Cards de métricas: scroll horizontal en mobile, grid en desktop
- Tabla de clientes (admin): vista de tarjetas en mobile, tabla en desktop
- **Nunca anchos fijos en píxeles que generen scroll horizontal**

### Sistema de espaciado
Usar siempre las utilidades de spacing de Tailwind. Sin valores arbitrarios salvo casos muy específicos justificados con comentario.

```
Espacio mínimo entre secciones: gap-6 (24px)
Padding de cards:               p-4 (16px) mobile / p-6 (24px) desktop
Padding de pantalla:            px-4 (16px) mobile / px-8 (32px) desktop
```

---

## 32. INTERNACIONALIZACIÓN (i18n)

La app opera en español (es) como idioma único por ahora. Preparar la estructura para escalar a inglés en el futuro si se necesita.

**Reglas:**
1. **Ningún string visible para el usuario se escribe inline.** No `<button>Guardar</button>`. Siempre `<button>{t('acciones.guardar')}</button>`.
2. Los strings viven en `messages/es.json`.
3. Los nombres de rutas, código y variables se mantienen en español para consistencia con el dominio del producto.

```json
// messages/es.json (fragmento)
{
  "modulos": {
    "estados": {
      "completado": "Completado",
      "en_progreso": "En curso",
      "pendiente": "Pendiente"
    },
    "nombres": {
      "01": "Auditoría inicial",
      "02": "Shopify optimizado",
      "03": "Optimización de conversión",
      "04": "Automatizaciones ManyChat",
      "05": "SEO ecommerce",
      "06": "Contenido orgánico",
      "07": "Email marketing",
      "08": "Métricas y análisis",
      "09": "Escalabilidad"
    }
  },
  "metricas": {
    "cr":   "Tasa de Conversión",
    "aov":  "Ticket Promedio",
    "ltv":  "Valor del Cliente",
    "cac":  "Costo de Adquisición",
    "roas": "Retorno en Pauta"
  },
  "acciones": {
    "guardar":   "Guardar",
    "cancelar":  "Cancelar",
    "eliminar":  "Eliminar",
    "subir":     "Subir archivo",
    "publicar":  "Publicar"
  }
}
```

---

## 33. MANEJO DE ERRORES Y ESTADOS DE CARGA

### Errores en API Routes

Toda API Route retorna errores en una sola forma consistente:

```ts
// Siempre esta forma, nunca ad-hoc
{ error: { message: string, code: string } }
```

Siempre con el HTTP status correcto:
- `400` → validación (Zod falló)
- `401` → no autenticado
`403` → no autorizado (rol incorrecto)
- `404` → recurso no encontrado
- `500` → error del servidor

### Patrón fijo para API Routes

```ts
// app/api/metricas/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { metricasSchema } from '@/features/metricas/metricas.schema'

export async function POST(req: Request) {
  // 1. Validar input con Zod
  const body = await req.json()
  const result = metricasSchema.safeParse(body)
  if (!result.success) {
    return Response.json(
      { error: { message: 'Datos inválidos', code: 'VALIDATION_ERROR' } },
      { status: 400 }
    )
  }

  // 2. Verificar autenticación
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return Response.json(
      { error: { message: 'No autenticado', code: 'UNAUTHORIZED' } },
      { status: 401 }
    )
  }

  // 3. Verificar rol
  if (session.user.user_metadata?.rol !== 'admin') {
    return Response.json(
      { error: { message: 'Sin permisos', code: 'FORBIDDEN' } },
      { status: 403 }
    )
  }

  // 4. Query a la base de datos
  const { data, error } = await supabase
    .from('metricas')
    .insert(result.data)
    .select()
    .single()

  if (error) {
    return Response.json(
      { error: { message: 'Error al guardar', code: 'DB_ERROR' } },
      { status: 500 }
    )
  }

  // 5. Retornar respuesta
  return Response.json(data, { status: 201 })
}
```

### Loading y errores en el cliente

React Query expone `isLoading`, `isError` y `error` en cada hook.

- **Loading → skeletons.** Nunca un spinner genérico para listas y grids. Los skeletons deben tener la forma aproximada del contenido real.
- **Errores de pantalla completa** → `error.tsx` por route group en Next.js.
- **Errores menores** (fetch fallido dentro de una card) → componente `ErrorState` en `components/ui/`.
- **Toasts** para confirmaciones y errores de acciones (guardar, subir, publicar). shadcn/ui ya los incluye.

```tsx
// Patrón de skeleton — nunca spinner genérico para listas
function ModulosGrid({ clienteId }: { clienteId: string }) {
  const { data: modulos, isLoading, isError } = useModulosCliente(clienteId)

  if (isLoading) return <ModulosGridSkeleton /> // Skeleton con la forma del grid
  if (isError)   return <ErrorState mensaje="No se pudieron cargar los módulos" />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {modulos.map(m => <ModuloCard key={m.id} modulo={m} />)}
    </div>
  )
}
```

---

## 34. TESTING

### Herramientas
- **Vitest** — tests unitarios e integración
- **React Testing Library** — tests de componentes
- **Playwright** — tests end-to-end en browser real

### Qué se testea — y qué no

No se busca 100% de cobertura. Se es selectivo.

**Se testea:**
- La lógica en `features/` — schemas Zod, funciones de transformación, cálculos de días/fases
- Componentes con comportamiento real — formularios de onboarding, actualización de estado de módulo
- Hooks con lógica compleja

**Solo E2E para flujos críticos:**
- Login como cliente y como admin
- Crear cliente nuevo (onboarding)
- Actualizar estado de un módulo
- Subir un recurso
- Ver métricas como cliente

**No se testea:**
- Componentes puramente visuales de `components/ui/` (vienen de shadcn)
- Configuración y boilerplate

### Dónde viven los tests

```
features/metricas/metricas.hooks.ts      # Lógica
features/metricas/metricas.hooks.test.ts # Test al lado del archivo

e2e/
  login.spec.ts
  onboarding.spec.ts
  modulos.spec.ts
```

---

## 35. COMPORTAMIENTO DEL CÓDIGO — REGLAS DE ESCRITURA

1. **Production-ready** — código limpio, comentado donde agrega contexto real, sin hacks ni shortcuts. Si requiere un comentario para entenderse, el comentario va.

2. **Mobile-first** — cada componente diseñado para 375px y escalado hacia arriba con clases responsive de Tailwind.

3. **Componentes reutilizables** — props tipadas con TypeScript, sin lógica hardcodeada, consistentes con el sistema de diseño.

4. **Accesibilidad básica** — contraste mínimo WCAG AA, `label` en todos los inputs de formularios, `alt` en todas las imágenes, `focus-visible` en todos los elementos interactivos.

5. **Sin dependencias innecesarias** — antes de instalar cualquier librería, evaluar si existe alternativa con CSS o utilidades ya instaladas. Toda dependencia nueva debe justificarse.

6. **Performance** — `next/image` para todas las imágenes, lazy loading de componentes pesados con `dynamic()`, sin re-renders innecesarios (revisar dependencias de `useEffect` y `useMemo`).

7. **Separación de concerns** — lógica de negocio en `features/`, lógica de UI en hooks locales, presentación en componentes.

8. **TypeScript strict** — sin `any`, sin `as` salvo casos muy justificados con comentario, sin ignorar errores de tipos.

9. **Variables de entorno** — nunca hardcodear claves, URLs ni valores de configuración. Siempre desde `.env.local` con el prefijo correcto (`NEXT_PUBLIC_` solo para lo que debe estar en el cliente).

10. **Nomenclatura en español** — los nombres de variables, funciones, componentes y archivos que representen conceptos del dominio van en español para mantener coherencia con el modelo de datos y el producto.

```ts
// ✓ CORRECTO — nomenclatura del dominio en español
const { data: modulos } = useModulosCliente(clienteId)
function calcularDiasRestantes(fechaInicio: Date): number { ... }
const estadoModulo: EstadoModulo = 'en_progreso'

// ✗ INCORRECTO — mezcla de idiomas sin sentido
const { data: modules } = useClientModules(clientId)
function calculateRemainingDays(startDate: Date): number { ... }
```

---

## 36. LO QUE NUNCA SE HACE

Esta lista no tiene excepciones. Si alguna situación parece justificar una excepción, discutirla antes de proceder.

- **Fetchear directamente dentro de un componente** — siempre usar un hook de la feature correspondiente
- **Hardcodear colores, fuentes o espaciado** — siempre usar tokens de Tailwind o CSS variables de marca
- **Escribir strings visibles para el usuario inline** — siempre usar el sistema de i18n
- **Duplicar una definición de tipo en dos lugares** — siempre mover a `types/index.ts` si más de un feature lo necesita
- **Poner datos del servidor en Zustand** — React Query es la caché del servidor
- **Traducir nombres de rutas o código al inglés** — la nomenclatura del dominio va en español
- **Usar npm o yarn** — pnpm únicamente
- **Importar un feature desde otro feature** — los tipos compartidos suben a `types/`, las utilidades compartidas suben a `lib/`
- **Retornar errores de API Route en forma ad-hoc** — siempre `{ error: { message, code } }` con el status correcto
- **Usar un spinner genérico donde cabe un skeleton** — en listas, grids y cards de métricas siempre skeleton
- **Anchos fijos en píxeles** que generen scroll horizontal en mobile
- **Entregar una pantalla sin verificarla en mobile, tablet y desktop**
- **Usar `any` en TypeScript** sin un comentario que justifique por qué es inevitable
- **Commitear `.env.local` o cualquier archivo con claves** — siempre en `.gitignore`
- **Usar el verde `#22C55E` como fondo dominante** — solo como acento, CTA y datos clave
- **Tutear al usuario** en ningún string de la interfaz — siempre ustedeo o voseo

---

## 37. CHECKLIST ANTES DE ENTREGAR

Responder todas con ✅ antes de marcar cualquier tarea como lista.

### Diseño y UI
- [ ] ¿El fondo base es negro profundo `#0A0A0A`?
- [ ] ¿El verde `#22C55E` aparece solo donde importa (CTA, acento, datos clave)?
- [ ] ¿El diseño es minimalista con impacto, sin decoración innecesaria?
- [ ] ¿Los íconos son outline/stroke de Tabler Icons, nunca filled?
- [ ] ¿La tipografía es Inter con jerarquía por tamaño/peso?
- [ ] ¿El componente fue verificado en mobile (375px), tablet (768px) y desktop (1280px)?
- [ ] ¿Los estados (hover, focus, disabled, loading, error) están implementados?
- [ ] ¿Los estados de módulo (completado/en curso/pendiente) son visualmente inequívocos?

### Copy e interfaz
- [ ] ¿El copy usa ustedeo o voseo, nunca tuteo?
- [ ] ¿El copy es directo, sin hipérboles, sin lenguaje de gurú?
- [ ] ¿Los strings de usuario están en `messages/es.json`, no hardcodeados?
- [ ] ¿No hay palabras prohibidas (gurú, increíble, fórmula, hack, viral)?

### Código y arquitectura
- [ ] ¿El código es production-ready y pasaría un code review exigente?
- [ ] ¿Las props y retornos están tipados con TypeScript (sin `any` sin justificar)?
- [ ] ¿El componente no hace fetching directo — usa un hook de feature?
- [ ] ¿Los tipos nuevos están en el lugar correcto (`feature.types.ts` o `types/index.ts`)?
- [ ] ¿La accesibilidad básica está cubierta (contraste WCAG AA, labels, alt, focus)?
- [ ] ¿No se instalaron dependencias innecesarias?
- [ ] ¿Las variables de entorno están en `.env.local` y no hardcodeadas?

### Seguridad (si toca datos o autenticación)
- [ ] ¿Las políticas RLS de Supabase impiden que un cliente vea datos de otro?
- [ ] ¿La API Route valida con Zod antes de tocar la base de datos?
- [ ] ¿La API Route verifica autenticación y rol antes de ejecutar la query?
- [ ] ¿Los errores retornan en la forma `{ error: { message, code } }` con el status correcto?

Si alguna respuesta es ❌ — revisar antes de entregar. Sin excepciones.

---

*Villamo Growth · CLAUDE.md · Versión 3.0 · Mayo 2026*
*app.villamogrowth.com · Contexto maestro para Claude Code*
*Documento confidencial de uso interno*
