# node-culqi

Permite todas las operaciones mencionadas en la documentación:

 * Crear venta
 * Anular venta
 * Consultar venta

Para usarlo se debe:

```javascript
var Culqi = require('node-culqi');

// Creamos el objeto reutilizable, los parámetros son (codigo_comercio, llave_comercio, ambiente (Culqi.PRODUCCION o Culqi.INTEGRACION))
var culqi = new Culqi('demo', 'JlhLlpOB5s1aS6upiioJkmdQ0OYZ6HLS2+/o4iYO2MQ=', Culqi.INTEGRACION);

// LLamamos los metodos (.crear, .anular o .consultar) con los parámetros indicados en la documentación de culqi.
culqi.crear({
	numero_pedido: 'NO0001x',
	moneda: 'PEN',
	monto: 99999,
	descripcion: 'Venta de prueba',
	correo_electronico: 'wmuro@me.com',
	cod_pais: 'PE',
	ciudad: 'Lima',
	direccion: 'Avenida Lima Nº123432',
	num_tel: '016663420',
	id_usuario_comercio: '016663420',
	nombres: 'William Oswaldo',
	apellidos: 'Muro Valencia'
}, function (err, resultado) {
	console.log(err, resultado);
    // Imprime
    // null { mensaje_respuesta_usuario: '',
    // monto: '9999900',
    // mensaje_respuesta: 'Venta creada exitosamente.',
    // ticket: 'YrUOIScV6L7xEptN1i1W0u3lV4XmKQi8yfH',
    // codigo_respuesta: 'venta_registrada',
    // numero_pedido: 'NO0001x',
    // codigo_comercio: 'demo',
    // informacion_venta: 'xxx' }
});

// Para anular:
culqi.anular({
	ticket: 'YrUOIScV6L7xEptN1i1W0u3lV4XmKQi8yfH'
}, function (err, resultado) {
	console.log(err, resultado);
});

// Para consultar:
culqi.consultar({
	ticket: 'YrUOIScV6L7xEptN1i1W0u3lV4XmKQi8yfH'
}, function (err, resultado) {
	console.log(err, resultado);
});
```
