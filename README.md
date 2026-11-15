# Análisis de seguridad de una API REST conforme a OWASP API Security Top 10 – 2023

### Trabajo práctico de ciberseguridad

**Seminario de Actualización III**  
**Instituto Politécnico Formosa**  
Tecnicatura Superior en Desarrollo de Software Multiplataforma

---

## Información académica

| Campo | Detalle |
|---|---|
| Estudiante | Monzón Felipe |
| Carrera | Tecnicatura Superior en Desarrollo de Software Multiplataforma |
| Curso | Segundo año |
| Asignatura | Seminario de Actualización III – Ciberseguridad |
| Institución | Instituto Politécnico Formosa |
| Equipo docente | Alejandro Sanabria y Alejandro Ruiz Díaz |
| Fecha de entrega | 15 de noviembre de 2026 |

---

## Índice

1. [Resumen del proyecto](#1-resumen-del-proyecto)
2. [Objetivos y alcance](#2-objetivos-y-alcance)
3. [Tecnologías](#3-tecnologías)
4. [Análisis de OWASP API Security Top 10](#4-análisis-de-owasp-api-security-top-10)
5. [Arquitectura de la aplicación](#5-arquitectura-de-la-aplicación)
6. [Rutas principales](#6-rutas-principales)
7. [Requisitos e instalación](#7-requisitos-e-instalación)
8. [Configuración y ejecución](#8-configuración-y-ejecución)
9. [Verificación y pruebas](#9-verificación-y-pruebas)
10. [Evidencias](#10-evidencias)
11. [Limitaciones y consideraciones de seguridad](#11-limitaciones-y-consideraciones-de-seguridad)
12. [Autoría y referencias](#12-autoría-y-referencias)

---

## 1. Resumen del proyecto

Este trabajo presenta el análisis práctico de una API REST desarrollado con fines académicos y tomando como marco de referencia **OWASP API Security Top 10 – 2023**.

El proyecto aborda riesgos de seguridad habituales en interfaces de programación de aplicaciones mediante la revisión de código, pruebas funcionales y la implementación de controles correctivos.

El proceso comprende la identificación de escenarios de riesgo, su reproducción dentro de un entorno local y controlado, la evaluación de sus posibles consecuencias y la comprobación del comportamiento de la aplicación luego de incorporar medidas de mitigación.

La API utiliza Node.js, TypeScript y Express; SQLite se emplea para la persistencia, y Docker Compose permite ejecutar el servicio en un contenedor.

Las pruebas descritas tienen un propósito exclusivamente educativo. No deben ejecutarse contra sistemas, servicios o datos de terceros sin autorización expresa.

## 2. Objetivos y alcance

### Objetivo general

Analizar y mejorar la seguridad de una API REST mediante la evaluación de los riesgos incluidos en OWASP API Security Top 10 – 2023 y la validación de controles correctivos en un entorno controlado.

### Objetivos específicos

- Examinar mecanismos de autenticación y autorización.
- Evaluar el acceso a recursos y propiedades de usuarios.
- Revisar controles aplicados a funciones administrativas.
- Analizar límites de consumo y el posible abuso de flujos de negocio.
- Examinar la validación de solicitudes que involucran servicios externos.
- Revisar la configuración HTTP y la exposición de rutas antiguas.
- Implementar mitigaciones acotadas a los escenarios estudiados.
- Registrar los resultados de las pruebas y las limitaciones que permanecen.

### Alcance

El análisis se limita a la aplicación y a los escenarios reproducidos en el entorno de desarrollo local. La presencia de una medida para una categoría OWASP no implica que todos sus riesgos estén eliminados ni constituye una certificación de seguridad.

## 3. Tecnologías

| Tecnología | Uso |
|---|---|
| Node.js 24 | Entorno de ejecución de JavaScript |
| TypeScript | Lenguaje y compilación del código fuente |
| Express 5 | Servidor y enrutamiento HTTP |
| SQLite | Persistencia de usuarios, tokens revocados y reclamos |
| JSON Web Token (JWT) | Emisión y validación de tokens de sesión |
| bcryptjs | Hash y verificación de contraseñas |
| Axios | Comunicación HTTP con un servicio externo |
| Helmet | Configuración de cabeceras HTTP de seguridad |
| Docker y Docker Compose | Construcción y ejecución del servicio en contenedor |
| pnpm | Instalación y administración de dependencias |
| Postman | Ejecución manual de solicitudes HTTP |
| Git y GitHub | Control de versiones y alojamiento del repositorio |

## 4. Análisis de OWASP API Security Top 10

La siguiente tabla resume las categorías examinadas y el alcance de las medidas presentes en la aplicación. Las mitigaciones deben interpretarse dentro de los límites indicados; no equivalen a una solución completa para todos los escenarios de cada categoría.

| Código | Categoría OWASP 2023 | Control o tratamiento en el proyecto |
|---|---|---|
| **API1** | Broken Object Level Authorization (BOLA) | Las operaciones autenticadas por identificador aplican controles de acceso al recurso y validaciones de autorización. |
| **API2** | Broken Authentication | Las contraseñas se almacenan con bcrypt; los JWT expiran, tienen un identificador único y pueden revocarse al cerrar sesión. El secreto se valida al iniciar la aplicación. |
| **API3** | Broken Object Property Level Authorization (BOPLA) | Las operaciones de actualización limitan las propiedades modificables para evitar que el cliente cambie atributos privilegiados. |
| **API4** | Unrestricted Resource Consumption | El reclamo de cupones está limitado a tres por usuario durante una hora y existe un máximo global de cien reclamos. Los registros se guardan en SQLite. |
| **API5** | Broken Function Level Authorization (BFLA) | Las rutas administrativas de registros y exportación requieren autenticación y el rol de administrador. |
| **API6** | Unrestricted Access to Sensitive Business Flows | El flujo de cupones aplica límites por cuenta y un máximo global. El control por cuenta no impide por sí solo el abuso mediante múltiples cuentas. |
| **API7** | Server Side Request Forgery (SSRF) | Se valida el protocolo HTTPS y se rechazan ciertos destinos locales conocidos en la URL de imagen procesada. Esta validación no sustituye una política completa de destinos permitidos ni la protección contra resolución DNS maliciosa. |
| **API8** | Security Misconfiguration | Se utiliza Helmet, se deshabilita la cabecera `X-Powered-By` y los errores internos se responden sin exponer detalles al cliente. |
| **API9** | Improper Inventory Management | Una ruta identificada como antigua permanece en el código fuente, pero no se monta en la aplicación principal. |
| **API10** | Unsafe Consumption of APIs | La consulta al servicio externo tiene tiempo de espera, límites de tamaño y validación de estado y estructura de respuesta. Los errores se registran y no se devuelven directamente al cliente. |

La comparación entre escenarios previos y posteriores a las correcciones se documenta mediante las pruebas y evidencias del trabajo. Los resultados se circunscriben a los casos evaluados.

## 5. Arquitectura de la aplicación

La aplicación organiza sus responsabilidades en los siguientes componentes:

- **Rutas (`src/routes`):** declaran los endpoints y asocian los middlewares con los controladores.
- **Controladores (`src/controllers`):** procesan las solicitudes y ejecutan la lógica de la aplicación.
- **Middlewares (`src/middlewares`):** validan la autenticación y los permisos.
- **Modelo (`src/models`):** define las estructuras de datos utilizadas por la aplicación.
- **Servicio de base de datos (`src/services`):** inicializa SQLite y gestiona las consultas.
- **Punto de entrada (`src/main.ts`):** configura Express, Helmet, las rutas y los endpoints de estado.

SQLite conserva los datos de usuarios, los identificadores de JWT revocados y los reclamos de cupones. En la configuración de Docker Compose, el directorio local `data/` se monta en `/app/data` dentro del contenedor para conservar la base de datos entre reinicios del servicio.

## 6. Rutas principales

Las rutas siguientes reflejan los prefijos montados en la aplicación. Las rutas marcadas como protegidas requieren el encabezado `Authorization: Bearer <token>`; las rutas administrativas requieren, además, el rol correspondiente.

| Método | Ruta | Acceso | Propósito |
|---|---|---|---|
| `GET` | `/` | Público | Mensaje de disponibilidad de la API. |
| `GET` | `/health` | Público | Estado básico del servicio. |
| `POST` | `/api/auth/register` | Público | Registro de usuario. |
| `POST` | `/api/auth/login` | Público | Inicio de sesión y emisión de JWT. |
| `POST` | `/api/auth/logout` | Protegido | Revocación del token presentado. |
| `GET` | `/api/users/admin/system-logs` | Solo administrador | Consulta de registros del sistema. |
| `GET` | `/api/users/admin/users/export_all` | Solo administrador | Exportación de usuarios. |
| `GET` | `/api/users/` | Público | Consulta general de usuarios. |
| `POST` | `/api/users/profile-picture` | Protegido | Actualización de imagen de perfil. |
| `PUT` | `/api/users/profile/update_email` | Protegido | Actualización del correo del perfil. |
| `GET` | `/api/users/search` | Público | Búsqueda de usuarios. |
| `GET` | `/api/users/account/:id` | Público | Consulta de información de cuenta. |
| `POST` | `/api/users/recover` | Público | Solicitud de recuperación de cuenta. |
| `GET`, `PUT`, `DELETE` | `/api/users/:id` | Protegido | Consulta, actualización o eliminación de un usuario, sujeta a autorización. |
| `POST` | `/api/coupons/claim` | Protegido | Reclamo de cupón sujeto a límites. |

La tabla es una referencia de las rutas registradas, no una recomendación para exponerlas públicamente sin una revisión adicional de requisitos, autorización y tratamiento de datos.

## 7. Requisitos e instalación

### Requisitos

Para ejecutar el contenedor se requiere:

- Git.
- Docker Desktop con Docker Compose disponible.

Para instalar dependencias, compilar y ejecutar directamente en el equipo se requiere además:

- Node.js 24.
- pnpm 12.15.0, según la versión declarada en `package.json`.

### Obtener el proyecto

```bash
git clone https://github.com/monzonfelipe0710-stack/owasp-api-security-lab-felipe-monzon.git
cd owasp-api-security-lab-felipe-monzon
```

## 8. Configuración y ejecución

### 8.1. Configurar el secreto de JWT

La aplicación requiere la variable `JWT_SECRET`. El proceso de inicio falla si no está definida o tiene menos de 64 caracteres.

Para generar un valor aleatorio con Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Crear un archivo `.env` en la raíz del proyecto y asignar el valor generado:

```dotenv
JWT_SECRET=REEMPLAZAR_POR_UN_SECRETO_ALEATORIO
```

No reutilizar el valor de ejemplo ni compartir el secreto. El archivo `.env` contiene configuración sensible y no debe incorporarse al repositorio.

La configuración de Docker Compose establece `PORT=3000`, `NODE_ENV=development` y `DB_PATH=/app/data/db.sqlite`. En ejecución local, la aplicación utiliza el puerto `3000` si `PORT` no está definido, y SQLite utiliza `db.sqlite` en el directorio de trabajo si `DB_PATH` no está definido.

### 8.2. Ejecutar mediante Docker Compose

Construir la imagen e iniciar el servicio:

```bash
docker compose up -d --build
```

Consultar el estado:

```bash
docker compose ps
```

Consultar los registros de inicio y ejecución:

```bash
docker compose logs -f express-api
```

La API se publica en `http://localhost:3000`.

Para detener el servicio:

```bash
docker compose down
```

Los datos de SQLite se almacenan en el directorio local `data/`, que está montado en el contenedor.

### 8.3. Ejecutar directamente con Node.js

Desde la raíz del repositorio, instalar las dependencias, compilar y ejecutar:

```bash
pnpm install --frozen-lockfile
pnpm run build
node dist/main.js
```

También se puede utilizar el script de desarrollo definido por el proyecto:

```bash
pnpm run start:dev
```

Para esta modalidad, configurar `JWT_SECRET` y, de ser necesario, `PORT` y `DB_PATH` en el entorno del proceso antes de iniciarlo.

## 9. Verificación y pruebas

Con el servicio activo, comprobar el endpoint de salud:

```bash
curl http://localhost:3000/health
```

Respuesta esperada:

```json
{
  "status": "ok"
}
```

También se pueden ejecutar solicitudes funcionales a las rutas documentadas mediante Postman. Las pruebas deben efectuarse únicamente contra la instancia local autorizada.

En particular, verificar que las respuestas de error no expongan información interna y que las operaciones protegidas se comporten de acuerdo con la identidad y los permisos del usuario.

El proyecto define scripts de compilación y ejecución en `package.json`; no se declara allí un script específico de pruebas automatizadas.

## 10. Evidencias

Las capturas de pantalla asociadas al proceso se organizan en la carpeta `evidencias/` del árbol de trabajo. Incluyen verificaciones de entorno, ejecución de la API y pruebas relacionadas con las categorías API1 a API10. Su numeración permite relacionarlas con el análisis y con el informe académico.

**Nota de distribución:** la configuración actual de Git ignora la carpeta `evidencias/`. Por consiguiente, las capturas locales no se incorporan automáticamente al repositorio al realizar un commit. Antes de entregar o publicar el proyecto, verificar qué archivos deben incluirse y seguir los criterios de entrega académicos y de privacidad aplicables.

## 11. Limitaciones y consideraciones de seguridad

- El límite de reclamos de cupones se aplica por cuenta y no impide que una persona cree o utilice varias cuentas.
- Los controles de SSRF descritos bloquean determinados destinos y validan el protocolo, pero no incluyen por sí solos una defensa integral ante cambios de DNS, todas las representaciones de direcciones IP privadas o redirecciones encadenadas. Para un despliegue real se recomienda una política estricta de destinos permitidos y controles de red.
- La persistencia en SQLite y los límites implementados son adecuados para el alcance didáctico, pero requieren evaluar transacciones, concurrencia, escalabilidad y monitoreo antes de cualquier uso productivo.
- La seguridad de la API depende también de la gestión de secretos, la configuración del contenedor, el control de acceso al entorno y la revisión periódica de dependencias.
- Las respuestas de salud confirman disponibilidad básica; no representan una evaluación integral de dependencias, capacidad ni seguridad.
- El código inicializa un usuario administrador de demostración con usuario `admin` y contraseña `admin123`. Estas credenciales son exclusivamente locales y no deben utilizarse en servicios expuestos; reemplazar o eliminar la cuenta antes de cualquier despliegue.
- Las medidas incluidas reducen riesgos concretos observados durante el trabajo, pero no garantizan la seguridad integral de una aplicación ni sustituyen una auditoría profesional.

## 12. Autoría y referencias

### Autor

**Monzón Felipe**  
Segundo año – Tecnicatura Superior en Desarrollo de Software Multiplataforma  
Instituto Politécnico Formosa

**Asignatura:** Seminario de Actualización III – Ciberseguridad

### Referencia principal

OWASP Foundation. (2023). *OWASP API Security Top 10 – 2023.*

https://owasp.org/API-Security/editions/2023/en/

---

**Instituto Politécnico Formosa**  
Seminario de Actualización III – Ciberseguridad  
Trabajo práctico desarrollado con fines académicos

Formosa, Argentina – 2026