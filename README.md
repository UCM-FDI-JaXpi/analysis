# Data Analysis Application - JaXpi
Aplicación web que realiza análisis de datos de videojuegos JavaScript, utilizando Vue 3 y la librería C3.js para generar diferentes gráficos.

Esta herramienta forma parte del ecosistema JaXpi y permite a desarrolladores, profesores y estudiantes visualizar y analizar datos almacenados en una base de datos *MongoDB*. Los datos son generados cuando los jugadores interactúan con los videojuegos, enviando trazas que siguen el estándar *xAPI*, que luego se almacenan en la base de datos para su posterior análisis.

## Prerrequisitos
- Tener un **servidor LRS** inicializado.  
- Tener un **videojuego** que mande trazas con el estándar xAPI a una base de datos a través de un servidor para que luego la aplicación web pueda realizar analíticas de esos datos.

Una opción que proponemos es utilizar todo el ecosistema JaXpi. Para ello, ve a los manuales del [servidor de JaXpi](https://github.com/UCM-FDI-JaXpi/server) y de la [librería de JaXpi](https://github.com/UCM-FDI-JaXpi/lib).
**Recuerda**, para utilizar nuestra librería te hará falta el código del videojuego JavaScript que se quiera analizar.

## Guía de uso 
Para ver la analítica de datos, sigue estos pasos:

1. Clona este repositorio en tu equipo.
2. Instala las dependencias de tu proyecto:
```bash
npm install
```
3. Ejecuta la aplicación web:
```bash
npm run serve
```
### Como desarrollador de videojuegos
Para ver las analíticas de tus videojuegos:
- Regístrate en la aplicación como 'Developer'.
- Inicia sesión con correo y contraseña en *Login*.
  
### Como profesor
- Regístrate en la aplicación como 'Teacher'.
- Inicia sesión con correo y contraseña en *Login*.
  
### Como estudiante
Para poder utilizar la aplicación, tu profesor tendrá que darte una clave de juego por cada sesión de juego que genere.
- Inicia sesión con una de estas claves en *Login as student*.

## Representación visual de los datos
En la aplicación web se muestran diferentes tipos de representaciones visuales de las analiticas realizadas en gráficos y tablas. Estos, son algunos de los ejemplos que puedes encontrar:
1. Objetos más utilizados
2. Interacciones con objetos
3. Interacciones con verbos
4. Partidas completadas y no completadas
5. Tiempo por nivel (medio y mejor)
6. Participacion en linea de tiempo
7. Registro de ultimas interacciones de los jugadores
