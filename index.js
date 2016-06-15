var request = require('request');
var crypto  = require('crypto');

var Culqi = function (codigo_comercio, llave_comercio, baseUrl) {
	this.codigo_comercio = codigo_comercio;
	this.llave_comercio  = llave_comercio;
	this.baseUrl         = baseUrl;
};

Culqi.INTEGRACION = 'https://integ-pago.culqi.com';
Culqi.PRODUCCION  = 'https://pago.culqi.com';

// --- Principal ---

Culqi.prototype.crear = function (informacion_venta, callback) {

	var that = this;

	var baseUrl  = that.baseUrl;
	var basePath = '/crear';

	// https://www.culqi.com/docs/#10-4-par-metros-obligatorios-del-json-con-la-informaci-n-de-la-venta
	// compruebo que informacion_venta tenga los parámetros obligatorios
	var params = ['numero_pedido', 'moneda', 'monto', 'descripcion', 'correo_electronico', 'cod_pais', 'ciudad', 'direccion', 'num_tel', 'id_usuario_comercio', 'nombres', 'apellidos'];

	var keys = Object.keys(informacion_venta);
	for (var i = 0; i < params.length; i++) {
		if (keys.indexOf(params[i]) === -1) return callback(new Error('No se enviaron los parámetros necesarios: ' + params[i]));
	}

	// Convierto el monto al valor correcto: 
	informacion_venta.monto = +(informacion_venta.monto.toFixed(2).replace('.', ''));
	informacion_venta.codigo_comercio = that.codigo_comercio;

	var obj = {
		codigo_comercio: that.codigo_comercio,
		informacion_venta: that.cifrar(JSON.stringify(informacion_venta))
	};

	request({
		url: baseUrl + '/api/v1/web' + basePath,
		method: 'POST',
		headers: {
			// Muy importante, aparentemente necesita un user agent para recibir la respuesta correcta del api
			'User-Agent': 'request',
			'Accept': 'application/json'
			// 'Accept': '*/*'
		},
		json: true,
		body: obj
	}, function (err, response, result) {
		if (err) callback (err);
		else {
			if (response.statusCode != 200) callback(new Error('No se pudo conectar al servidor.'))
			else {
				var descifrado = JSON.parse(that.descifrar(result).toString('utf8'));
				if (descifrado.informacion_venta) {
					descifrado.informacion_venta = JSON.parse(that.descifrar(descifrado.informacion_venta).toString('utf8'));
				} 
				callback(null, descifrado);
			}
		}
	});
};

Culqi.prototype.anular = function (informacion_venta, callback) {

	var that = this;

	var baseUrl  = that.baseUrl;
	var basePath = '/devolver';

	// https://www.culqi.com/docs/#12-1-3-par-metros-obligatorios-del-json
	// compruebo que informacion_venta tenga los parámetros obligatorios
	var params = ['ticket'];

	var keys = Object.keys(informacion_venta);
	for (var i = 0; i < params.length; i++) {
		if (keys.indexOf(params[i]) === -1) return callback(new Error('No se enviaron los parámetros necesarios: ' + params[i]));
	}

	var obj = {
		codigo_comercio: that.codigo_comercio,
		informacion_venta: that.cifrar(JSON.stringify(informacion_venta))
	};

	request({
		url: baseUrl + '/api/v1/' + basePath,
		method: 'POST',
		headers: {
			// Muy importante, aparentemente necesita un user agent para recibir la respuesta correcta del api
			'User-Agent': 'request',
			'Accept': 'application/json'
			// 'Accept': '*/*'
		},
		json: true,
		body: obj
	}, function (err, response, result) {
		if (err) callback (err);
		else {
			if (response.statusCode != 200) callback(new Error('No se pudo conectar al servidor.'))
			else {
				var descifrado = JSON.parse(that.descifrar(result).toString('utf8'));
				if (descifrado.informacion_venta) {
					descifrado.informacion_venta = JSON.parse(that.descifrar(descifrado.informacion_venta).toString('utf8'));
				} 
				callback(null, descifrado);
			}
		}
	});
};

Culqi.prototype.consultar = function (informacion_venta, callback) {

	var that = this;

	var baseUrl  = that.baseUrl;
	var basePath = '/consultar';

	// https://www.culqi.com/docs/#12-1-3-par-metros-obligatorios-del-json
	// compruebo que informacion_venta tenga los parámetros obligatorios
	var params = ['ticket'];

	var keys = Object.keys(informacion_venta);
	for (var i = 0; i < params.length; i++) {
		if (keys.indexOf(params[i]) === -1) return callback(new Error('No se enviaron los parámetros necesarios: ' + params[i]));
	}

	var obj = {
		codigo_comercio: that.codigo_comercio,
		informacion_venta: that.cifrar(JSON.stringify(informacion_venta))
	};

	request({
		url: baseUrl + '/api/v1/' + basePath,
		method: 'POST',
		headers: {
			// Muy importante, aparentemente necesita un user agent para recibir la respuesta correcta del api
			'User-Agent': 'request',
			'Accept': 'application/json'
			// 'Accept': '*/*'
		},
		json: true,
		body: obj
	}, function (err, response, result) {
		var descifrado = JSON.parse(that.descifrar(result).toString('utf8'));
		if (descifrado.informacion_venta) {
			descifrado.informacion_venta = JSON.parse(that.descifrar(descifrado.informacion_venta).toString('utf8'));
		} 
		callback(null, descifrado);
	});
};

// --- Util ---

Culqi.prototype.cifrar = function (str) {
	var iv = crypto.pseudoRandomBytes(16);
	var cipher = crypto.createCipheriv('aes-256-cbc', this.base64URLSafetoBytes(this.llave_comercio), iv);
	cipher.setAutoPadding(true);
	var buf1 = cipher.update(str);
  var buf2 = cipher.final();
  return this.bytesToBase64URLSafe(Buffer.concat([iv, buf1, buf2]));
};

Culqi.prototype.base64URLSafetoBytes = function (base64) {
	base64 += Array(5 - base64.length % 4).join('=');
	base64 = base64.replace(/\-/g, '+').replace(/\_/g, '/');
	return new Buffer(base64, 'base64');
};

Culqi.prototype.bytesToBase64URLSafe = function encode(buffer) {
	return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

Culqi.prototype.descifrar = function (str) {
	var buf1, buf2, cipher, iv;
	str = this.base64URLSafetoBytes(str);
  var iv = str.slice(0, 16);
  str = str.slice(16);
  cipher = crypto.createDecipheriv('aes-256-cbc', this.base64URLSafetoBytes(this.llave_comercio), iv);
  cipher.setAutoPadding(true);
  buf1 = cipher.update(str);
  buf2 = cipher.final();
  return Buffer.concat([buf1, buf2]);
};

module.exports = Culqi;