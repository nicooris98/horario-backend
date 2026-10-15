# Trabajo Práctico N° 3: Sockets TCP/UDP y Concurrencia en Java

**Asignatura:** Desarrollo de Aplicaciones para Ambientes Distribuidos  
**Docente:** Lic. Gabriel Artaza  
**Alumna:** Yazmin Agustina Dorado  

---

## 📋 Descripción del Proyecto
Este trabajo práctico implementa aplicaciones en red utilizando la API `java.net` de Java, abarcando dos paradigmas fundamentales de comunicación:
1. **TCP (Orientado a conexión):** Servidor de chat multihilo concurrente con capacidad de *broadcast* para múltiples clientes simultáneos.
2. **UDP (Sin conexión):** Sistema de telemetría y alertas con recepción de datagramas y manejo de resiliencia mediante `SocketTimeoutException`.

---

## ⚙️ Instrucciones de Compilación y Ejecución

### 1. Compilación General
Se recomienda compilar especificando la versión de compatibilidad si es necesario:
```bash
javac --release 21 src/ejercicio1/*.java
javac --release 21 src/ejercicio2/*.java