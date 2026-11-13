# Sistema web de métodos numéricos

Sistema web de la Unidad 3 de Métodos Numéricos. Resuelve integrales definidas mediante trapecio y Simpson 1/3 compuesto, y problemas de valor inicial mediante Euler y Heun.

## Documentación del proyecto

[Descargar informe en Word de la sesión 14](documentacion/Informe_metodos_numericos_S14.docx)

El informe incluye carátula, fundamento matemático, resultados verificados, instrucciones para nuevos ejercicios, capturas del sistema y las tres hojas del desarrollo manual de Euler y Heun.

## Sitio web

https://lucianagutierrez-049.github.io/Metodos-Numericos_U3/

## Funcionalidades

- Ingreso de función, límites de integración y número de subintervalos.
- Gráfica de la función y los trapecios.
- Desarrollo paso a paso y tabla de evaluaciones y pesos.
- Comparación de aproximaciones y errores cuando se proporciona el valor exacto.
- Exportación CSV e impresión del procedimiento.

## Ejecución local

Abrir `index.html` en un navegador. No requiere instalación ni conexión a Internet.

Usar `*` para multiplicar y `^` para potencias. Las funciones trigonométricas se evalúan en radianes. La función debe ser continua en el intervalo.

## Tecnologías

HTML, CSS y JavaScript, sin dependencias externas.

## Simpson 1/3 compuesto y sesión 13

Se puede elegir trapecio o Simpson, ingresar cualquier función compatible y obtener el desarrollo manual. Simpson requiere n par y usa los coeficientes 1,4,2,...,4,1. Compara n=2,4,6,12,24 y el valor ingresado.

El campo opcional M representa una cota justificada de la cuarta derivada en todo el intervalo; permite calcular (b-a)h^4 M/180. No se obtiene mediante integración simbólica. El ejemplo energético usa M=5.132, cota conservadora válida. La página explica por qué el dato M=0.45 de la guía no garantiza el error para esa función.

## Sesión 14 - Euler y Heun

Abrir [Calculadora de EDO](https://lucianagutierrez-049.github.io/Metodos-Numericos_U3/edo.html).

Permite ingresar f(x,y), condición inicial, objetivo y paso, comparar Euler con Heun y consultar cada iteración. La solución exacta es opcional y se usa para errores reales. Valida dominio en evaluaciones, paso positivo, llegada con pasos iguales y hasta 1000 pasos. Incluye CSV e impresión. No realiza despeje o solución simbólica.
