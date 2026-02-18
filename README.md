# 🚢 SHIP SIM V3.0

Sistema avanzado de monitorización y simulación naval con interfaz moderna y capacidades de inyección de fallos en tiempo real.

<img width="1920" height="905" alt="image" src="https://github.com/user-attachments/assets/3e611539-0183-4851-a2d8-c1f41cf4adca" />


## 📋 Descripción

SHIP SIM V3.0 es una plataforma completa diseñada para simular, monitorizar y gestionar sistemas críticos de una embarcación. Ofrece una visualización en tiempo real del estado de motores, generadores, radares y otros sistemas esenciales, permitiendo a los operadores detectar anomalías, inyectar fallos para entrenamiento y analizar datos históricos.

La interfaz de usuario ha sido construida con un diseño **Glassmorphism / Neon Cyberpunk**, ofreciendo una experiencia visual inmersiva y de alto contraste, ideal para entornos de operación nocturna o simulada.

## ✨ Características Principales

- **Monitorización en Tiempo Real**: Visualización de 6 sistemas principales (Motor, Generador, Achique, Radar, Gobierno, Incendios).
- **Sistema de Alertas Inteligente**: Notificaciones instantáneas (Toast) para eventos de disparo (Tripped), advertencias y recuperación.
- **Control Manual y Automático**: Capacidad para encender/apagar sistemas manualmente o inyectar fallos de relé y sensores.
- **Simulación Física**: Los valores de los sensores reaccionan al estado del sistema (decadencia exponencial al apagar, fluctuaciones realistas al encender).
- **Historial de Datos**: Almacenamiento y visualización de logs de eventos anómalos.
- **Arquitectura de Microservicios**: Backend modular basado en Python (FastAPI) y containerizado con Docker.

## 🛠️ Tecnologías Utilizadas

### Frontend

- **React 19** + **Vite**: Rendimiento y desarrollo moderno.
- **TypeScript**: Tipado estático para mayor robustez.
- **Tailwind CSS**: Estilizado utility-first.
- **Sonner**: Sistema de notificaciones toast.
- **Recharts**: Gráficos de datos en tiempo real.
- **Lucide React**: Iconografía moderna.

### Backend

- **Python 3.11**: Lenguaje base.
- **FastAPI**: Framework web de alto rendimiento.
- **UV**: Gestor de paquetes y entornos virtuales ultra-rápido.
- **SQLite**: Persistencia de datos ligera.
- **Docker**: Containerización completa.

## 🚀 Requisitos Previos

- [Docker](https://www.docker.com/get-started) instalado y ejecutándose.
- [Git](https://git-scm.com/) para clonar el repositorio.

## 📦 Instalación y Ejecución

1.  **Clonar el repositorio:**

    ```bash
    git clone https://github.com/tu-usuario/barco-simulator-3.0.git
    cd barco-simulator-3.0
    ```

2.  **Iniciar los servicios con Docker Compose:**

    ```bash
    docker compose up --build
    ```

    _Este comando descargará las imágenes necesarias, construirá el frontend y los microservicios backend, e iniciará el entorno completo._

3.  **Acceder a la aplicación:**
    - Abra su navegador y vaya a: **[http://localhost:3000](http://localhost:3000)**

## 📂 Estructura del Proyecto

```
barco-simulator-3.0/
├── frontend/           # Aplicación React (Interfaz de Usuario)
├── simulacion/         # Microservicio: Lógica física y simulación
├── datos/              # Microservicio: Persistencia y gestión de logs
├── fallos/             # Microservicio: Orquestador de inyección de fallos
├── docker-compose.yml  # Orquestación de contenedores
└── .gitignore          # Configuración de exclusiones de Git
```

## 🔗 Puntos de Acceso (Endpoints)

| Servicio          | URL Local                    | Descripción                       |
| :---------------- | :--------------------------- | :-------------------------------- |
| **Frontend**      | `http://localhost:3000`      | Interfaz Principal (Dashboard)    |
| **Simulador API** | `http://localhost:8001/docs` | Swagger UI del Simulador          |
| **Fallos API**    | `http://localhost:8002/docs` | Swagger UI del Inyector de Fallos |
| **Datos API**     | `http://localhost:8003/docs` | Swagger UI del Colector de Datos  |

## 🕹️ Guía de Uso Rápida

1.  **Dashboard**: Observe los valores de los sensores fluctuando en las tarjetas de sistema.
2.  **Inyectar Fallo**: Pulse el botón de _Alerta_ (Triángulo) en una tarjeta para simular un fallo de relé. Verá una alerta roja y el sistema se detendrá.
3.  **Control Manual**: Pulse el botón de _Energía_ para apagar o encender un sistema manualmente. Los valores decaerán suavemente al apagarlo.
4.  **Historial**: Consulte la barra lateral derecha para ver el registro de eventos críticos pasados.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

Desarrollado con ❤️ para simulación naval avanzada.
