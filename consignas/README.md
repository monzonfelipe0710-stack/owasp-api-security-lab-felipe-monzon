# Examen Parcial - Seguridad en APIs (OWASP API Top 10 2023)

### Segundo Año — Tecnicatura Superior en Desarrollo de Software Multiplataforma

**Instituto Politécnico Formosa | Materia:** Seminario de Actualización III - Ciberseguridad

#### Profesores:

- **Alejandro Sanabría**
- **Alejandro Ruiz Díaz**

---

## Modalidad y Objetivo de la Evaluación

Esta aplicación es una API REST desarrollada con Express.js, TypeScript y SQLite, diseñada intencionalmente con las 10 vulnerabilidades críticas del estándar **OWASP API Security Top 10 (2023)**.

- **Modalidad:** Examen Parcial Práctico **Individual**.
- **Objetivo:** Auditar el código fuente (`src/`), interactuar con los endpoints en ejecución, identificar las 10 vulnerabilidades solicitadas, demostrar su explotación y proponer una corrección técnica en código para cada una.
- **Integridad Académica:** El examen es estrictamente individual. No está permitido compartir informes, capturas, comandos ni payloads entre estudiantes. **Toda evidencia que involucre registros o sesiones debe realizarse utilizando usuarios identificables con tu apellido** (por ejemplo: `ruiz_diaz_user`, `ruiz_diaz@test.com`); entregas con evidencias genéricas o duplicadas de otros compañeros serán anuladas.

> **Nota sobre el alcance:** Aunque durante la auditoría puedas encontrar rutas auxiliares o comportamientos adicionales en el código, tu informe debe identificar y mapear específicamente los **10 riesgos del OWASP API Security Top 10 (2023)** detallados en la consigna.

---

## Instalación y Ejecución de la Aplicación

La API escucha por defecto en `http://localhost:3000` y crea/inicializa automáticamente la base de datos `db.sqlite`.

### Herramientas Recomendadas

- **Clientes REST:** Postman, Insomnia, Thunder Client (VS Code) o `curl`.
- **Proxies de intercepción (opcional):** Burp Suite Community Edition u OWASP ZAP.

### Uso con Docker o Podman (Recomendado)

#### Opción A: Con Docker Compose

Desde la raíz del proyecto, ejecuta:

```bash
docker compose up --build -d
```

Para ver los logs o detener la aplicación (y limpiar volúmenes):

```bash
docker compose logs -f
docker compose down -v
```

#### Opción B: Con Docker CLI Tradicional

1. **Construir la imagen:**

```bash
docker build -t express-owasp-api-t10-2023 .
```

2. **Ejecutar el contenedor:**

```bash
docker run -d --rm --name express-api -p 3000:3000 express-owasp-api-t10-2023
```

### Opción C: Ejecución Local (Sin Contenedores)

En caso de no utilizar Docker/Podman, puedes ejecutar la aplicación directamente con **Node.js (v18+)** y **pnpm**:

```bash
pnpm install
pnpm run start:dev
```

---

## CONSIGNAS: Auditoría OWASP API Top 10 (2023)

Debes analizar el código fuente y probar la API en funcionamiento para localizar, explotar y remediar cada una de las siguientes **10 categorías**:

### **API1:2023 - Broken Object Level Authorization (BOLA)**

Permite que un usuario acceda a recursos pertenecientes a otros usuarios manipulando identificadores en la petición, debido a la falta de validación de propiedad sobre el objeto solicitado.

- **Objetivo de auditoría:** Verifica cómo la API valida si el usuario autenticado tiene permiso para acceder al recurso especificado por identificador.

### **API2:2023 - Broken Authentication**

Fallas en los mecanismos de autenticación, protección de credenciales o gestión del ciclo de vida de la sesión y los tokens.

- **Objetivo de auditoría:** Analiza el proceso de autenticación, el almacenamiento de credenciales, las defensas frente a intentos repetidos de acceso, la configuración de los tokens y el ciclo de vida de la sesión al cerrarla.

### **API3:2023 - Broken Object Property Level Authorization (BOPLA)**

Permite leer propiedades sensibles que no deberían exponerse o modificar atributos protegidos de un objeto mediante la entrada del cliente (exposición excesiva de datos y asignación masiva).

- **Objetivo de auditoría:** Inspecciona qué campos devuelve la API al consultar recursos y qué propiedades acepta y persiste al actualizar un registro.

### **API4:2023 - Unrestricted Resource Consumption**

La API no impone límites adecuados sobre la cantidad de datos, registros o recursos que un cliente puede solicitar en una petición.

- **Objetivo de auditoría:** Evalúa cómo se gestionan los parámetros de consulta y paginación en endpoints que listan colecciones de datos.

### **API5:2023 - Broken Function Level Authorization (BFLA)**

Ausencia o falla en la verificación de privilegios y roles antes de ejecutar operaciones sensibles o administrativas.

- **Objetivo de auditoría:** Identifica las rutas y operaciones que deberían estar restringidas a usuarios con privilegios elevados y verifica si pueden ejecutarse con una cuenta estándar.

### **API6:2023 - Unrestricted Access to Sensitive Business Flows**

Exposición de flujos de negocio críticos o recursos limitados sin mecanismos para evitar su abuso automatizado y masivo.

- **Objetivo de auditoría:** Localiza funcionalidades vinculadas a reglas de negocio con recursos finitos o promocionales y evalúa si existe control contra invocaciones repetitivas.

### **API7:2023 - Server-Side Request Forgery (SSRF)**

Ocurre cuando la API realiza peticiones HTTP hacia un destino controlado por el usuario sin validar ni restringir direcciones internas o esquemas permitidos.

- **Objetivo de auditoría:** Busca funcionalidades donde el servidor obtenga recursos externos a partir de una dirección provista por el cliente y comprueba si es posible alcanzar servicios internos o locales.

### **API8:2023 - Security Misconfiguration**

Configuraciones inseguras de la aplicación o del entorno, como el manejo inadecuado de excepciones que filtra información interna del servidor o de la base de datos.

- **Objetivo de auditoría:** Provoca condiciones de error en la aplicación y analiza qué información técnica devuelven las respuestas del servidor y el manejador global de errores.

### **API9:2023 - Improper Inventory Management**

Exposición de versiones antiguas, deprecadas u olvidadas de la API que mantienen controles de seguridad inferiores o nulos respecto a la versión vigente.

- **Objetivo de auditoría:** Revisa el esquema de enrutamiento completo de la aplicación en busca de endpoints heredados o versiones paralelas expuestas.

### **API10:2023 - Unsafe Consumption of APIs**

Confianza implícita en las respuestas provenientes de APIs de terceros sin aplicar validación ni sanitización antes de procesarlas o almacenarlas.

- **Objetivo de auditoría:** Examina en el código cómo interactúa la aplicación con servicios externos y analiza qué impacto tendría una respuesta maliciosa devuelta por dicho proveedor.

---

## Guía para la Elaboración del Informe

### Estructura Obligatoria por cada Vulnerabilidad

Para cada una de las 10 vulnerabilidades, el informe debe desarrollar las siguientes cuatro secciones de manera clara y técnica:

**1. Identificación y Descripción de la Vulnerabilidad**

- Indica el/los archivo(s) y función(es) del directorio `src/` donde se origina la falla.
- Explica con tus propias palabras en qué consiste la vulnerabilidad dentro del contexto específico de esta aplicación y cuál es su impacto.

**2. Proceso de Explotación**

- Describe paso a paso cómo identificaste y explotaste la falla de forma reproducible.
- Detalla método HTTP, URL/endpoint, encabezados (`Authorization`, `Content-Type`, etc.), parámetros y payloads utilizados. _(En caso de vulnerabilidades conceptuales frente a servicios externos simulados, describe el vector de ataque y el payload malicioso esperado)._

**3. Evidencia Verificable**

- Adjunta capturas de pantalla de la herramienta utilizada (Postman, Insomnia, Burp Suite, terminal, etc.) o fragmentos de logs/respuestas del servidor que demuestren inequívocamente la explotación.
- **Requisito obligatorio:** En todas las pruebas que involucren usuarios creados por ti, el `username` y el `email` visibles en las capturas/respuestas **deben incluir tu apellido** (ej. `garcia_test`).

**4. Propuesta de Mitigación Técnica (Obligatorio)**

- Explica la lógica de remediación requerida para cerrar la brecha de seguridad.
- **Incluye obligatoriamente el fragmento de código TypeScript/Express corregido**, señalando exactamente en qué archivo y función debe aplicarse.

---

## Criterios de Entrega y Evaluación

### Requisitos de Entrega

- **Formato y Nombre del Archivo:** Documento único en formato **PDF** nombrado siguiendo el patrón `Apellido_Nombre_Parcial_OWASP_API.pdf`.
- **Medio de Entrega:** A través de la plataforma que se consignará en clases, antes de la fecha y hora límite establecida para el parcial.
- **Presentación Formal:**
  - **Carátula:** Con tus datos completos (Apellido, Nombre, DNI), institución, carrera, materia, profesores y fecha.
  - **Índice:** Tabla de contenidos estructurada.
  - **Desarrollo:** Resolución ordenada de las 10 vulnerabilidades siguiendo los 4 puntos obligatorios por cada una.
  - **Referencias:** Citas en formato limpio (ej. documentación oficial de OWASP API Security Top 10 2023) en caso de consultar fuentes externas.

### Rúbrica de Puntuación

Cada una de las 10 vulnerabilidades tiene un valor máximo de **10 puntos** (**Total: 100 puntos**):

| Criterio Evaluado por Vulnerabilidad                               | Puntaje Máximo |   Peso   |
| :----------------------------------------------------------------- | :------------: | :------: |
| **1. Identificación en código y descripción contextualizada**      |    2.0 pts     |   20%    |
| **2. Proceso de explotación paso a paso y reproducible**           |    2.5 pts     |   25%    |
| **3. Evidencia verificable y propia (con usuario identificable)**  |    2.5 pts     |   25%    |
| **4. Mitigación técnica efectiva con código TypeScript corregido** |    3.0 pts     |   30%    |
| **Total por vulnerabilidad**                                       |  **10.0 pts**  | **100%** |

- **Nota mínima de aprobación:** **60 puntos (60%)**.
