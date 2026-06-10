# SustraiApp — 45 Preguntas y Respuestas

---

## Visión general

**1. ¿Qué es SustraiApp y qué problema resuelve?**
SustraiApp es una aplicación web fullstack para descubrir eventos, gastronomía y cultura del País Vasco. Centraliza información turística y cultural dispersa en distintas fuentes, ofrece recomendaciones personalizadas basadas en los intereses y ubicación del usuario, y soporta los tres idiomas del entorno: español, euskera e inglés.

---

**2. ¿Qué stack tecnológico usa el proyecto?**
- **Frontend:** React 19, React Router 7, Vite, Tailwind CSS 4, Framer Motion
- **Backend:** Node.js con Express 5, Sequelize 6 como ORM
- **Base de datos:** PostgreSQL 16
- **Infraestructura:** Docker y Docker Compose
- **Autenticación:** JWT con access token (15 min) y refresh token (7 días) en cookies HttpOnly
- **ML:** API en Flask (Python 3.11) con seeder de datos incluido, accesible vía `ML_API_URL`

---

**3. ¿Cómo está organizado el código del frontend?**
Sigue una arquitectura por features: cada funcionalidad principal (auth, events, gastronomy, culture, chatbot, profile, admin) vive en su propia carpeta dentro de `Frontend/src/features/`. Los elementos compartidos (componentes, contextos, hooks, UI base, traducciones) están en `Frontend/src/shared/`.

---

## Autenticación y seguridad

**4. ¿Cómo funciona el sistema de autenticación?**
Usa doble token JWT. Al hacer login o registro se generan dos cookies HttpOnly: un `access_token` (15 min) y un `refresh_token` (7 días). El middleware `protect` verifica el access token en cada petición protegida. Cuando expira, el frontend llama a `POST /api/auth/refresh` para obtener uno nuevo usando el refresh token.

---

**5. ¿Cómo se protegen las rutas privadas en el backend?**
Con dos middlewares encadenables: `protect` extrae y verifica el JWT del access token en la cookie, busca el usuario en BD y lo asigna a `req.user`; `isAdmin` comprueba que `req.user.role === 'admin'`. Las rutas de solo lectura son públicas, las de escritura requieren `protect`, y las de administración requieren `protect + isAdmin`.

---

**6. ¿Cómo se almacenan las contraseñas?**
Nunca en texto plano. Se hashean con `bcrypt` usando 10 salt rounds antes de guardarlas en la base de datos. En el login se usa `bcrypt.compare()` para verificar sin necesidad de desencriptar.

---

**7. ¿Qué validaciones tiene el formulario de registro?**
Nombre y apellido (2-100 caracteres, solo letras con acentos), email (formato válido, máx. 254 caracteres), contraseña (mínimo 8, máximo 128 caracteres), confirmación de contraseña (debe coincidir), edad (entero entre 1 y 119), género (hombre/mujer/otro) y municipio (obligatorio). Todos los inputs pasan por una función `sanitize()` que elimina caracteres de control, HTML peligroso y path traversal.

---

**8. ¿Cómo se gestionan los roles de usuario?**
Hay dos roles: `"user"` (por defecto al registrarse) y `"admin"`. El rol se almacena en la tabla User y viaja dentro del payload del JWT. No hay endpoint público para cambiar el rol; solo se puede modificar directamente en la base de datos o a través del panel de administración.

---

## Base de datos

**9. ¿Cómo está estructurada la base de datos?**
PostgreSQL con tres esquemas: `shared` (municipios), `user_data` (usuarios, intereses, favoritos, preferencias, reseñas) y `market_data` (cultura, eventos, gastronomía). Sequelize actúa como ORM y gestiona las relaciones entre modelos.

---

**10. ¿Cómo funciona el sistema de intereses?**
La tabla `Interest` es jerárquica (auto-referencial con `father_id`). Tiene categorías raíz y subcategorías hijas. El usuario selecciona intereses hoja (sin hijos) que se guardan en la tabla pivote `UserInterest`. En el onboarding y en el perfil se muestra el árbol completo para que el usuario elija.

---

**11. ¿Cómo se registran los favoritos en la base de datos?**
La tabla `Favorite` usa un patrón de entidad polimórfica: guarda `entidad_id` (ID del ítem) y `entidad_tipo` (string: `'evento'`, `'gastronomia'` o `'cultura'`), junto con `user_id`. Esto evita tener tres tablas separadas de favoritos para cada tipo de contenido.

---

**12. ¿Qué información se guarda en las preferencias del usuario?**
La tabla `Preference` almacena: `rango_precio` (bajo/medio/alto), `movilidad_reducida` (boolean) y `municipios_interes` (array de enteros con IDs de municipios). Estas preferencias se usan para personalizar las recomendaciones del ML.

---

## Frontend y UX

**13. ¿Cómo funciona el sistema de internacionalización?**
Es un sistema propio sin librerías externas. Hay un único archivo `translations.js` con un objeto JSON que contiene todos los textos en `es`, `eu` y `en`. El `LanguageContext` expone la función `t` que devuelve el objeto del idioma activo. El idioma se persiste en `localStorage` con la clave `sustrai_lang`. Además, existe un `translateService` para traducir dinámicamente contenido que viene de la base de datos.

---

**14. ¿Cómo funciona el sistema de favoritos en el frontend?**
El `FavoritesContext` carga todos los favoritos del usuario desde la API al iniciar sesión. Cuando el usuario añade o elimina un favorito, aplica un **optimistic update** (actualiza el estado local inmediatamente) y luego llama a la API. Si la API falla, hace rollback al estado anterior. El método `isFavorite(id, variant)` permite a cualquier tarjeta saber si debe mostrar el corazón relleno o vacío.

---

**15. ¿Qué filtros tienen las páginas de listado?**
Cada sección tiene filtros propios. Eventos: esta semana, fin de semana, cerca de ti, en euskera, por tipo (concierto, teatro, festival…) y ordenamiento. Gastronomía: mejor valorados, distinción Michelin/Repsol, entorno especial, cerca de ti, por tipo (restaurante, sidrería…). Cultura: museos, patrimonio, visita guiada, cerca de ti, por tipo.

---

**16. ¿Cómo funciona el componente de onboarding?**
Aparece tras el registro. El usuario puede seleccionar intereses del catálogo jerárquico, elegir su rango de precio preferido, indicar si tiene movilidad reducida y marcar municipios de interés. Al finalizar, se lanzan en paralelo dos llamadas: `updateInterests()` y `updatePreferences()`. Si el usuario pulsa "Saltar", también se omite correctamente.

---

**17. ¿Cómo se animan las páginas?**
Con Framer Motion. El patrón más usado es `fadeUp`: los elementos aparecen con opacidad 0 y desplazados hacia abajo (y: 20), y animan hasta su posición final con un delay escalonado usando el prop `custom={i}`. Este patrón se aplica especialmente en páginas de perfil y detalle.

---

## API y backend

**18. ¿Cuál es la estructura general de la API REST?**
Todas las rutas están bajo `/api`. Las rutas públicas de lectura no requieren autenticación. Las rutas de usuario están bajo `/api/users/me/*` y requieren el middleware `protect`. Las de administración están bajo `/api/admin/*` y requieren `protect + isAdmin`. Hay un endpoint de salud en `/api/health`.

---

**19. ¿Cómo están organizados los endpoints de cada sección de contenido?**
Cada sección (eventos, gastronomía, cultura) sigue el mismo patrón: rutas con filtros específicos (ej. `/esta-semana`, `/mejor-valorados`, `/cerca-de-ti`), más el CRUD completo. Las rutas GET son públicas. Las de creación, actualización, eliminación y toggle (activo/patrocinado) requieren ser admin.

---

**20. ¿Cómo funciona el endpoint "cerca de ti"?**
Recibe el `municipality_id` del usuario autenticado. Primero intenta obtener resultados del ML API. Si falla, busca en la BD por ese municipio. Si no hay resultados y el municipio no es Bilbao, hace un segundo intento con Bilbao como fallback (por ser la ciudad más grande). Si todo falla, devuelve array vacío.

---

**21. ¿Cómo se gestionan los errores HTTP en el backend?**
Hay dos middlewares al final de la cadena de Express: `notFound` devuelve 404 con la ruta que no se encontró, y `errorHandler` captura cualquier error lanzado en los controladores y devuelve el `statusCode` del error o 500 por defecto, junto con el mensaje de error.

---

## ML y chatbot

**22. ¿Cómo se integra el sistema de recomendaciones ML?**
Es una API en Flask (Python) que corre como servicio Docker. Todos los servicios del backend (cultura, gastronomía, eventos) intentan primero obtener datos del ML con un timeout de 5 segundos. Si la respuesta está vacía o hay un error, el fallback es transparente: se sirven los datos directamente de PostgreSQL. El frontend nunca sabe si los datos vienen del ML o de la BD.

---

**23. ¿Cómo funciona el chatbot?**
Es un componente flotante que abre un panel de chat. Cada sesión genera un `session_id` único (`session-${Date.now()}`). El mensaje del usuario se envía al backend (`POST /api/chat`), que lo reenvía al ML API junto con el `X-User-Id` si hay sesión activa (para personalización). El ML devuelve texto de respuesta e ítems sugeridos. Los ítems se muestran como enlaces que navegan al detalle correspondiente (evento, restaurante o lugar cultural).

---

## Panel de administración

**24. ¿Qué puede hacer un administrador?**
Desde el panel admin puede: listar, buscar y eliminar usuarios; ver y gestionar comercios (negocios de gastronomía); activar/desactivar entidades con toggle `active`; y marcar entidades como patrocinadas con toggle `is_sponsored`. También tiene acceso completo al CRUD de eventos, gastronomía y cultura vía API.

---

**25. ¿Cómo se accede al panel de administración?**
La ruta está protegida en el frontend con un componente `RequireAuth` que verifica el rol. En el perfil del usuario, si `user.role === 'admin'`, aparece el acceso al panel. Cualquier llamada a las rutas `/api/admin/*` también es validada en el backend con el middleware `isAdmin`.

---

## Infraestructura y configuración

**26. ¿Qué variables de entorno necesita el proyecto?**
Backend: `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_HOST`, `DB_PORT`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`, `FRONTEND_URL`, `PORT`. pgAdmin: `PGADMIN_DEFAULT_EMAIL`, `PGADMIN_DEFAULT_PASSWORD`. Hay un `.env.example` en la raíz con todas las variables documentadas. El ML API URL se inyecta automáticamente en Docker como `http://data:5442/api`.

---

**27. ¿Cómo está configurado CORS?**
En `index.js`, el origen permitido se toma de `process.env.FRONTEND_URL`. Las cookies viajan con `credentials: true`, lo que exige que el origen sea explícito (no `*`). En el frontend, todas las llamadas a la API se hacen con `credentials: 'include'` para que las cookies se envíen automáticamente.

---

## Reseñas

**28. ¿Cómo funciona el sistema de reseñas?**
Hay tres tablas separadas: `CultureReview`, `EventReview` y `GastronomyReview`. Cada una guarda `user_id`, el ID de la entidad, `puntuacion` y `texto`. Los endpoints siguen el patrón `GET /api/reviews/:tipo/:id` para leer y `POST /api/reviews/:tipo/:id` para crear. Un usuario puede eliminar sus propias reseñas con `DELETE /api/reviews/:tipo/:id`.

---

## Municipios

**29. ¿Cómo funciona el autocompletado de municipio en el registro?**
El componente `MunicipalityAutocomplete` carga la lista completa de municipios del País Vasco desde un servicio local. El usuario escribe y se filtran en el cliente, sin llamadas adicionales al servidor. Al seleccionar, se guarda el `id` del municipio, no el nombre.

---

## Perfil

**30. ¿Qué puede editar el usuario en su perfil?**
En `ProfileAccount`, el usuario puede editar en modo inline (sin página separada): nombre, municipio, género y edad. Además puede actualizar sus intereses (seleccionando del catálogo jerárquico completo) y sus preferencias (rango de precio, movilidad reducida, municipios de interés). Al guardar, se lanzan en paralelo hasta tres llamadas: `updateMe()`, `updateInterests()` y `updatePreferences()`.

---

## Preguntas generales del proyecto

**31. ¿Qué significa "Sustrai" y por qué ese nombre?**
"Sustrai" significa "raíz" en euskera. El nombre refleja el enfoque del proyecto: conectar a las personas con lo más auténtico y arraigado de Euskadi — su gastronomía, su cultura y sus eventos — desde una perspectiva local y cercana, alejada del turismo masivo genérico.

---

**32. ¿Quién es el público objetivo de la aplicación?**
La aplicación está pensada para varios perfiles: residentes del País Vasco que quieren descubrir actividades y lugares de calidad cerca de ellos, visitantes que buscan una guía curada más allá de las listas genéricas de internet, y negocios locales que quieren darse a conocer. El sistema de filtros y recomendaciones personalizadas está diseñado para adaptarse a todos ellos.

---

**33. ¿De dónde provienen los datos de la aplicación?**
Los datos provienen principalmente de **GEO-EUSKADI**, el portal de datos abiertos del Gobierno Vasco. Esto garantiza que la información sobre eventos, gastronomía y cultura sea oficial, actualizada y de cobertura completa para todo el territorio del País Vasco.

---

**34. ¿En qué contexto se desarrolló el proyecto?**
Es el proyecto final del **Desafío Final de Inetum · BBK Bootcamps 2026**. Se desarrolló como un proyecto de equipo que integra todas las competencias del bootcamp: diseño, frontend, backend, base de datos, inteligencia artificial y despliegue.

---

**35. ¿Qué diferencia a SustraiApp de otras guías o aplicaciones de turismo?**
Tres elementos la diferencian: la personalización real basada en los intereses, ubicación y preferencias del usuario (no recomendaciones genéricas); el soporte nativo del euskera junto con español e inglés, respetando la identidad cultural del territorio; y la integración de un motor de recomendaciones ML que aprende del contexto del usuario, no solo de búsquedas.

---

**36. ¿Por qué se eligió el País Vasco como ámbito geográfico?**
Por la riqueza y singularidad cultural y gastronómica de la región, que tiene identidad propia y gran cantidad de datos públicos de calidad disponibles a través de GEO-EUSKADI. Además, el bilingüismo (español/euskera) añade una capa de complejidad real e interesante para resolver desde el punto de vista técnico.

---

**37. ¿Qué tipos de contenido ofrece la aplicación?**
Tres categorías principales: **Eventos** (conciertos, festivales, teatro, danza, bertsolarismo, exposiciones, conferencias y ferias), **Gastronomía** (restaurantes, bares, sidrerías, bodegas, asadores y cafés, incluyendo establecimientos con distinción Michelin o Repsol) y **Cultura** (museos, monumentos, cascos históricos, patrimonio, teatros y espacios naturales). Todos con filtros, reseñas y sistema de favoritos.

---

**38. ¿Qué ventaja tiene registrarse frente a usar la app sin cuenta?**
Los usuarios no registrados pueden explorar todo el contenido. Al registrarse, se desbloquean: guardar favoritos (sincronizados en todos los dispositivos), dejar reseñas, acceder a recomendaciones personalizadas basadas en el municipio e intereses, y tener un perfil que el chatbot puede usar para ofrecer sugerencias más relevantes.

---

**39. ¿Cómo se personaliza la experiencia del usuario?**
En el onboarding (justo tras el registro) el usuario elige sus intereses de un catálogo jerárquico, su rango de precio preferido, si tiene movilidad reducida y los municipios que más le interesan. Estas preferencias alimentan el motor ML para ordenar y filtrar el contenido más relevante en cada sección. Todo es editable después desde el perfil.

---

**40. ¿Qué es el contenido "patrocinado" o "destacado"?**
Los negocios pueden aparecer como destacados (`is_sponsored`) en los listados, lo que les da mayor visibilidad. Las tarjetas de contenido patrocinado muestran una etiqueta "Destacado". Este toggle lo gestiona únicamente el administrador desde el panel de administración, lo que abre una vía de monetización para la plataforma.

---

**41. ¿Qué papel juega el chatbot en la aplicación?**
Es un asistente conversacional flotante disponible desde cualquier página. El usuario puede hacerle preguntas en lenguaje natural ("¿dónde puedo cenar bien en Bilbao esta noche?") y el chatbot, impulsado por el ML, devuelve respuestas personalizadas con enlaces directos a los establecimientos o eventos sugeridos. Si el usuario está autenticado, las recomendaciones se personalizan con su perfil.

---

**42. ¿Cómo pueden los negocios aparecer en la aplicación?**
A través de dos vías: la landing page de negocio (accesible desde el footer de la app) explica cómo registrar un establecimiento. Los datos estructurados vienen de GEO-EUSKADI, pero los negocios pueden contactar para solicitar su inclusión o actualización. El panel de administración permite al equipo gestionar manualmente la activación y el patrocinio de cualquier comercio.

---

**43. ¿La aplicación es accesible para personas con movilidad reducida?**
Sí, hay consciencia de accesibilidad en dos niveles. En el perfil del usuario existe la opción "movilidad reducida" que el motor ML tiene en cuenta para filtrar y priorizar lugares con accesibilidad. A nivel de código, se usan atributos ARIA en los componentes clave (roles, aria-label, aria-live en el chatbot) y el HTML semántico se respeta en los formularios.

---

**44. ¿Tiene la aplicación presencia más allá de la propia web?**
Sí, el proyecto tiene una landing page informativa independiente alojada en GitHub Pages con información general sobre la plataforma y un blog con artículos sobre gastronomía y cultura vasca. Ambas están enlazadas desde el footer de la app principal (secciones "¿Tienes un negocio?" y "Blog").

---

**45. ¿Cómo se despliega el proyecto completo?**
Con un único comando desde la raíz del proyecto: `docker compose up --build`. Docker Compose orquesta seis servicios en orden: PostgreSQL (con healthcheck), el seeder de datos en Python (se ejecuta una sola vez para poblar la base de datos y termina), la API ML/Flask, el backend Node.js, el frontend React/Vite y pgAdmin. Solo es necesario tener Docker instalado y el archivo `.env` configurado en la raíz.
